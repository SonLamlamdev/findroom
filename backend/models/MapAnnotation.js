const mongoose = require('mongoose');

const mapAnnotationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['flood', 'price', 'security'],
    required: true
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: String,
    district: String,
    city: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude] - GeoJSON format
        required: true
      }
    }
  },
  data: {
    // For flood type
    floodLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    floodDescription: String,
    lastFloodDate: Date,
    
    // For price type
    priceRange: {
      min: Number,
      max: Number
    },
    priceDescription: String,
    
    // For security type
    securityLevel: {
      type: String,
      enum: ['safe', 'moderate', 'caution']
    },
    securityDescription: String,
    securityRating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  verified: {
    type: Boolean,
    default: false
  },
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'removed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for geospatial queries
mapAnnotationSchema.index({ 'location.coordinates': '2dsphere' });
mapAnnotationSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('MapAnnotation', mapAnnotationSchema);

