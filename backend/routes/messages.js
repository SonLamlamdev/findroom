const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { Conversation } = require('../models/Message');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// Helper function to safely compare IDs
const areIdsEqual = (id1, id2) => {
  if (!id1 || !id2) return false;
  return id1.toString() === id2.toString();
};

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
      .lean();

    // Group logic to handle multiple chats with same person
    const conversationMap = new Map();
    
    allConversations.forEach(conv => {
      // Find the "other" person
      const otherParticipant = conv.participants.find(p => !areIdsEqual(p._id, req.userId));
      
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
    console.error("Get Conversations Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get or create conversation
router.post('/conversations', auth, async (req, res) => {
  try {
    const { listingId, recipientId } = req.body;

    if (!recipientId) return res.status(400).json({ error: 'Recipient ID required' });
    if (areIdsEqual(req.userId, recipientId)) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    // Try to find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, recipientId] },
      participants: { $size: 2 }
    })
      .populate('participants', 'name email avatar role')
      .populate('listing', 'title images price location')
      .sort('-lastMessageAt -createdAt');

    if (!conversation) {
      // Create new
      conversation = new Conversation({
        participants: [req.userId, recipientId],
        listing: listingId || undefined
      });
      await conversation.save();
      await conversation.populate('participants', 'name email avatar role');
      if (listingId) await conversation.populate('listing', 'title images price location');
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages in a conversation
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(404).json({ error: 'Invalid conversation ID' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // ROBUST CHECK: Ensure user is a participant
    const isParticipant = conversation.participants.some(p => areIdsEqual(p, req.userId));

    if (!isParticipant) {
      console.log(`Access Denied: User ${req.userId} is not in participants:`, conversation.participants);
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Mark as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.userId },
        read: false
      },
      { read: true, readAt: new Date() }
    );

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) return res.status(400).json({ error: 'Message content required' });

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    // Robust Check
    if (!conversation.participants.some(p => areIdsEqual(p, req.userId))) {
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
    console.error("Send Message Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete message
router.delete('/messages/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId).populate('conversation');
    if (!message) return res.status(404).json({ error: 'Message not found' });

    // Check participation
    const isParticipant = message.conversation.participants.some(p => areIdsEqual(p, req.userId));
    if (!isParticipant) return res.status(403).json({ error: 'Access denied' });

    // Check ownership
    if (!areIdsEqual(message.sender, req.userId)) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.userId }).select('_id');
    const conversationIds = conversations.map(c => c._id);
    const unreadCount = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: req.userId },
      read: false
    });
    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;  