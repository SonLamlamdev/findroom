const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { Conversation } = require('../models/Message');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// Helper: Safely compare IDs (String vs ObjectId)
const areIdsEqual = (id1, id2) => {
  if (!id1 || !id2) return false;
  return id1.toString() === id2.toString();
};

// --- NUCLEAR OPTION (Temporary Route) ---
// Visit /api/messages/nuke in your browser/Postman to reset ALL chat data
router.get('/nuke', async (req, res) => {
  try {
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    res.send("<h1>☢️ Database Nuked: All conversations and messages deleted.</h1>");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get all conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    // 1. Find conversations where user is a participant
    let allConversations = await Conversation.find({
      participants: req.userId
    })
      .populate('participants', '_id name email avatar role')
      .populate('listing', '_id title images price location')
      .populate('lastMessage')
      .sort('-lastMessageAt')
      .lean();

    // 2. SELF-HEALING FILTER
    // Remove conversations where the user isn't *actually* in the participants array 
    // (Fixes "Ghost" conversations from deleted users)
    const validConversations = [];
    const brokenIds = [];

    for (const conv of allConversations) {
      // Check if current user exists in the populated participants list
      const isParticipant = conv.participants.some(p => p && areIdsEqual(p._id, req.userId));
      
      if (isParticipant) {
        validConversations.push(conv);
      } else {
        // Mark for deletion if found by ID query but missing in array (DB corruption)
        brokenIds.push(conv._id);
      }
    }

    // Async cleanup of broken data
    if (brokenIds.length > 0) {
      console.log(`Cleaning up ${brokenIds.length} broken conversations...`);
      Conversation.deleteMany({ _id: { $in: brokenIds } }).exec(); // Fire and forget
    }

    // 3. Group by Other User (to merge duplicates)
    const conversationMap = new Map();
    validConversations.forEach(conv => {
      const otherParticipant = conv.participants.find(p => !areIdsEqual(p._id, req.userId));
      
      if (!otherParticipant) return; // Skip if other user is deleted
      
      const key = `user_${otherParticipant._id}`;
      const existing = conversationMap.get(key);
      
      if (!existing || (conv.lastMessageAt && new Date(conv.lastMessageAt) > new Date(existing.lastMessageAt || 0))) {
        conversationMap.set(key, conv);
      }
    });

    const conversations = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime());

    res.json({ conversations });
  } catch (error) {
    console.error("Get Conversations Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get or Create Conversation
router.post('/conversations', auth, async (req, res) => {
  try {
    const { listingId, recipientId } = req.body;
    if (!recipientId) return res.status(400).json({ error: 'Recipient required' });
    
    // 1. Try to find existing
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, recipientId] }
    })
    .populate('participants', 'name email avatar role')
    .populate('listing', 'title images price location')
    .sort('-lastMessageAt');

    // 2. If not found, create new
    if (!conversation) {
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
    console.error('Create Conversation Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Messages (With Self-Healing)
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(404).json({ error: 'Invalid ID' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    // Check participation using RAW IDs (no populate needed)
    const isParticipant = conversation.participants.some(id => areIdsEqual(id, req.userId));

    if (!isParticipant) {
      console.warn(`[Auto-Fix] User ${req.userId} denied access to ${conversationId}. Deleting broken conversation.`);
      
      // SELF-HEALING: Delete the broken conversation to stop the error loop
      await Conversation.findByIdAndDelete(conversationId);
      await Message.deleteMany({ conversation: conversationId });
      
      return res.status(404).json({ error: 'Conversation invalid and removed' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort('-createdAt')
      .limit(50);

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send Message
router.post('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    // Double check participation
    if (!conversation.participants.some(id => areIdsEqual(id, req.userId))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = new Message({
      conversation: conversationId,
      sender: req.userId,
      content
    });

    await message.save();
    await message.populate('sender', 'name avatar');

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete individual message
router.delete('/messages/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (!areIdsEqual(message.sender, req.userId)) return res.status(403).json({ error: 'Denied' });

    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;