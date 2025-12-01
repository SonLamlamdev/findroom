const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { Conversation } = require('../models/Message');
const Listing = require('../models/Listing');
const { auth } = require('../middleware/auth');

// Get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const allConversations = await Conversation.find({
      participants: req.userId
    })
      .populate('participants', 'name email avatar role')
      .populate('listing', 'title images price location')
      .populate('lastMessage')
      .sort('-lastMessageAt')
      .limit(50);

    // Deduplicate conversations: for conversations without listing between same two users,
    // keep only the most recent one
    const conversationMap = new Map();
    
    allConversations.forEach(conv => {
      if (!conv.listing) {
        // Direct message - find the other participant
        const otherParticipant = conv.participants.find(p => p._id.toString() !== req.userId.toString());
        if (otherParticipant) {
          const key = `direct_${otherParticipant._id}`;
          const existing = conversationMap.get(key);
          
          // Keep the one with most recent message or creation date
          if (!existing || 
              (conv.lastMessageAt && (!existing.lastMessageAt || conv.lastMessageAt > existing.lastMessageAt)) ||
              (!conv.lastMessageAt && !existing.lastMessageAt && conv.createdAt > existing.createdAt)) {
            conversationMap.set(key, conv);
          }
        } else {
          // Fallback: use conversation ID as key
          conversationMap.set(conv._id.toString(), conv);
        }
      } else {
        // Conversation with listing - use listing + participants as key
        const otherParticipant = conv.participants.find(p => p._id.toString() !== req.userId.toString());
        const key = `listing_${conv.listing._id}_${otherParticipant?._id || ''}`;
        conversationMap.set(key, conv);
      }
    });

    // Convert map values back to array
    const conversations = Array.from(conversationMap.values())
      .sort((a, b) => {
        const aTime = a.lastMessageAt || a.createdAt;
        const bTime = b.lastMessageAt || b.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

    res.json({ conversations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get or create conversation
router.post('/conversations', auth, async (req, res) => {
  try {
    const { listingId, recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient ID required' });
    }

    // Prevent self-messaging
    if (req.userId.toString() === recipientId.toString()) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    // Check if conversation already exists
    let conversation;
    
    if (listingId) {
      // Conversation with listing
      conversation = await Conversation.findOne({
        participants: { $all: [req.userId, recipientId] },
        listing: listingId
      })
        .populate('participants', 'name email avatar role')
        .populate('listing', 'title images price location');
    } else {
      // Conversation without listing (direct message between users)
      // Find ANY conversation between these two users without listing
      // First try with $exists: false
      conversation = await Conversation.findOne({
        $and: [
          { participants: { $all: [req.userId, recipientId] } },
          { participants: { $size: 2 } },
          { $or: [
            { listing: { $exists: false } },
            { listing: null }
          ]}
        ]
      })
        .populate('participants', 'name email avatar role')
        .sort('-createdAt'); // Get the most recent one if multiple exist
    }

    if (!conversation) {
      try {
        // Create new conversation
        // Only include listing field if listingId is provided
        if (listingId) {
          conversation = new Conversation({
            participants: [req.userId, recipientId],
            listing: listingId
          });
        } else {
          // Don't set listing field at all for direct messages
          conversation = new Conversation({
            participants: [req.userId, recipientId]
          });
        }
        
        await conversation.save();
        await conversation.populate('participants', 'name email avatar role');
        
        if (listingId) {
          await conversation.populate('listing', 'title images price location');
        }
      } catch (saveError) {
        // If duplicate key error, try to find the conversation again
        if (saveError.code === 11000 || saveError.name === 'MongoServerError') {
          console.log('Duplicate key error, trying to find existing conversation...');
          
          if (listingId) {
            conversation = await Conversation.findOne({
              participants: { $all: [req.userId, recipientId] },
              listing: listingId
            })
              .populate('participants', 'name email avatar role')
              .populate('listing', 'title images price location');
          } else {
            // Try to find existing conversation again - prioritize $exists: false
            conversation = await Conversation.findOne({
              $and: [
                { participants: { $all: [req.userId, recipientId] } },
                { participants: { $size: 2 } },
                { listing: { $exists: false } }
              ]
            })
              .populate('participants', 'name email avatar role')
              .sort('-createdAt');
            
            // If not found, try with null
            if (!conversation) {
              conversation = await Conversation.findOne({
                $and: [
                  { participants: { $all: [req.userId, recipientId] } },
                  { participants: { $size: 2 } },
                  { listing: null }
                ]
              })
                .populate('participants', 'name email avatar role')
                .sort('-createdAt');
            }
          }
          
          if (conversation) {
            console.log('Found existing conversation, returning it');
          } else {
            console.error('Duplicate key error but conversation not found:', saveError);
            // Return a more user-friendly error
            return res.status(409).json({ 
              error: 'Conversation already exists',
              message: 'A conversation with this user already exists. Please refresh the page.'
            });
          }
        } else {
          throw saveError;
        }
      }
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
});

// Get messages in a conversation
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.userId },
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content required' });
    }

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = new Message({
      conversation: conversationId,
      sender: req.userId,
      content: content.trim()
    });

    await message.save();
    await message.populate('sender', 'name avatar');

    // Update conversation last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.json({ message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unread message count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId
    }).select('_id');

    const conversationIds = conversations.map(c => c._id);

    const unreadCount = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: req.userId },
      read: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

