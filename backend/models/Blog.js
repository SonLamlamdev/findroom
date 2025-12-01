const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['tips', 'experience', 'checklist', 'scam-report', 'discussion', 'other'],
    default: 'discussion'
  },
  tags: [{
    type: String
  }],
  images: [{
    type: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  published: {
    type: Boolean,
    default: true
  },
  // Custom ID for easy management
  customId: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate custom ID before saving
blogSchema.pre('save', async function(next) {
  if (!this.customId) {
    // Generate ID: BLOG-YYYYMMDD-XXXX
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.customId = `BLOG-${dateStr}-${random}`;
  }
  next();
});

// Indexes for better search
blogSchema.index({ tags: 1 });
blogSchema.index({ title: 'text', content: 'text' });
// Note: customId already has an index from unique: true, no need to add it again

module.exports = mongoose.model('Blog', blogSchema);








