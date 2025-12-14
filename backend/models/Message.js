const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ read: 1 });

module.exports = mongoose.model('Message', messageSchema);

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: Date
}, {
  timestamps: true
});

// Index for faster queries (non-unique to avoid conflicts)
conversationSchema.index({ participants: 1 });
conversationSchema.index({ participants: 1, listing: 1 }, { sparse: true });

// Note: Uniqueness is handled in the route handler to avoid index conflicts
// between conversations with listing and without listing.
// We don't use unique indexes here because:
// 1. Conversations with listing: unique by (participants + listing)
// 2. Conversations without listing: unique by (participants only)
// MongoDB unique indexes don't handle this mixed scenario well

module.exports.Conversation = mongoose.model('Conversation', conversationSchema);

