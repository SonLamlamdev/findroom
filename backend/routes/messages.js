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

    // Group conversations by landlord (other participant) instead of by listing
    // This means if a landlord has multiple listings, all conversations with that landlord
    // will be merged into one conversation
    const conversationMap = new Map();
    
    allConversations.forEach(conv => {
      const otherParticipant = conv.participants.find(p => p._id.toString() !== req.userId.toString());
      
      if (!otherParticipant) {
        // Fallback: use conversation ID as key
        conversationMap.set(conv._id.toString(), conv);
        return;
      }
      
      // Group by other participant (landlord or tenant) - regardless of listing
      const key = `user_${otherParticipant._id}`;
      const existing = conversationMap.get(key);
      
      // Keep the conversation with the most recent message
      if (!existing) {
        conversationMap.set(key, conv);
      } else {
        // Compare by lastMessageAt or createdAt
        const existingTime = existing.lastMessageAt || existing.createdAt;
        const currentTime = conv.lastMessageAt || conv.createdAt;
        
        // Always keep the conversation with the most recent message
        if (currentTime && (!existingTime || new Date(currentTime) > new Date(existingTime))) {
          conversationMap.set(key, conv);
        }
        // If existing is more recent, keep it (don't replace)
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

    // Find ANY conversation between these two users (regardless of listing)
    // This groups all conversations with the same landlord/tenant into one
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, recipientId] },
      participants: { $size: 2 }
    })
      .populate('participants', 'name email avatar role')
      .populate('listing', 'title images price location')
      .sort('-lastMessageAt -createdAt'); // Get the most recent one

    if (!conversation) {
      try {
        // Create new conversation
        // Include listing if provided, but it's optional since we group by user
        conversation = new Conversation({
          participants: [req.userId, recipientId],
          listing: listingId || undefined
        });
        
        await conversation.save();
        await conversation.populate('participants', 'name email avatar role');
        
        if (listingId) {
          await conversation.populate('listing', 'title images price location');
        }
      } catch (saveError) {
        // If duplicate key error, try to find the conversation again
        if (saveError.code === 11000 || saveError.name === 'MongoServerError') {
          console.log('Duplicate key error, trying to find existing conversation...');
          
          conversation = await Conversation.findOne({
            participants: { $all: [req.userId, recipientId] },
            participants: { $size: 2 }
          })
            .populate('participants', 'name email avatar role')
            .populate('listing', 'title images price location')
            .sort('-lastMessageAt -createdAt');
          
          if (conversation) {
            console.log('Found existing conversation, returning it');
          } else {
            console.error('Duplicate key error but conversation not found:', saveError);
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

// Delete a message (soft delete - only for the user who deletes it)
router.delete('/messages/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId)
      .populate('conversation', 'participants');

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Verify user is participant in the conversation
    const conversation = message.conversation;
    if (!conversation.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only allow user to delete their own messages
    if (message.sender.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    // Soft delete: add to deletedBy array or mark as deleted
    // For now, we'll actually delete it since there's no deletedBy field
    // In production, you might want to add a deletedBy field for soft delete
    await Message.findByIdAndDelete(messageId);

    res.json({ message: 'Message deleted successfully' });
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

