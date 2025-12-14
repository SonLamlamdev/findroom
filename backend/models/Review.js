const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stayedAt: {
    type: Date, // Date when user stayed at the listing
    required: true
  },
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    cleanliness: Number,
    location: Number,
    value: Number,
    communication: Number
  },
  comment: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  pros: [String],
  cons: [String],
  verified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  landlordResponse: {
    comment: String,
    date: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reviewSchema.index({ listing: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ landlord: 1 });

module.exports = mongoose.model('Review', reviewSchema);


