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
      .populate('participants', '_id name email avatar role')
      .populate('listing', '_id title images price location')
      .populate('lastMessage')
      .sort('-lastMessageAt')
      .limit(50)
      .lean()
      .maxTimeMS(1000);

    const conversationMap = new Map();
    
    allConversations.forEach(conv => {
      const otherParticipant = conv.participants.find(p => p._id.toString() !== req.userId.toString());
      
      if (!otherParticipant) {
        conversationMap.set(conv._id.toString(), conv);
        return;
      }
      
      const key = `user_${otherParticipant._id}`;
      const existing = conversationMap.get(key);
      
      if (!existing) {
        conversationMap.set(key, conv);
      } else {
        const existingTime = existing.lastMessageAt || existing.createdAt;
        const currentTime = conv.lastMessageAt || conv.createdAt;
        
        if (currentTime && (!existingTime || new Date(currentTime) > new Date(existingTime))) {
          conversationMap.set(key, conv);
        }
      }
    });

    const conversations = Array.from(conversationMap.values())
      .sort((a, b) => {
        const aTime = a.lastMessageAt || a.createdAt;
        const bTime = b.lastMessageAt || b.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

    res.json({ conversations });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Get or create conversation
router.post('/conversations', auth, async (req, res) => {
  try {
    const { listingId, recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient ID required' });
    }

    if (req.userId.toString() === recipientId.toString()) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, recipientId] },
      participants: { $size: 2 }
    })
      .populate('participants', 'name email avatar role')
      .populate('listing', 'title images price location')
      .sort('-lastMessageAt -createdAt');

    if (!conversation) {
      try {
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
        if (saveError.code === 11000 || saveError.name === 'MongoServerError') {
          conversation = await Conversation.findOne({
            participants: { $all: [req.userId, recipientId] },
            participants: { $size: 2 }
          })
            .populate('participants', 'name email avatar role')
            .populate('listing', 'title images price location')
            .sort('-lastMessageAt -createdAt');
          
          if (!conversation) {
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

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // FIX: Use .some() and .toString() to compare ObjectIds correctly
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.userId
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

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

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // FIX: Use .some() and .toString() to compare ObjectIds correctly
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.userId
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = new Message({
      conversation: conversationId,
      sender: req.userId,
      content: content.trim()
    });

    await message.save();
    await message.populate('sender', 'name avatar');

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.json({ message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a message
router.delete('/messages/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId)
      .populate('conversation', 'participants');

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const conversation = message.conversation;
    // FIX: Use .some() and .toString()
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.userId
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (message.sender.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

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