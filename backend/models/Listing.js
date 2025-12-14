const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  deposit: {
    type: Number,
    default: 0
  },
  location: {
    address: {
      type: String,
      required: true
    },
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
    },
    nearbyUniversities: [{
      name: String,
      distance: Number // in km
    }]
  },
  roomDetails: {
    area: Number, // m2
    capacity: Number,
    bedrooms: Number,
    bathrooms: Number,
    floor: Number,
    roomType: {
      type: String,
      enum: ['single', 'shared', 'apartment', 'house']
    }
  },
  amenities: [{
    type: String
  }],
  utilities: {
    electricity: {
      included: Boolean,
      price: Number
    },
    water: {
      included: Boolean,
      price: Number
    },
    internet: {
      included: Boolean,
      price: Number
    },
    parking: {
      available: Boolean,
      price: Number
    }
  },
  images: [{
    type: String
  }],
  videos: [{
    type: String
  }],
  rules: {
    type: String
  },
  availableFrom: {
    type: Date
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'hidden', 'pending'],
    default: 'available'
  },
  featured: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  viewsHistory: [{
    date: Date,
    count: Number
  }],
  saves: {
    type: Number,
    default: 0
  },
  searchKeywords: [{
    keyword: String,
    count: Number
  }],
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  // Custom ID for easy management
  customId: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Convert GeoJSON coordinates to {lat, lng} format for frontend
      if (ret.location?.coordinates?.coordinates && Array.isArray(ret.location.coordinates.coordinates)) {
        const [lng, lat] = ret.location.coordinates.coordinates;
        ret.location.coordinates = { lat, lng };
      }
      // Remove internal fields
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      // Convert GeoJSON coordinates to {lat, lng} format for frontend
      if (ret.location?.coordinates?.coordinates && Array.isArray(ret.location.coordinates.coordinates)) {
        const [lng, lat] = ret.location.coordinates.coordinates;
        ret.location.coordinates = { lat, lng };
      }
      // Remove internal fields
      delete ret.__v;
      return ret;
    }
  }
});

// Generate custom ID before saving
listingSchema.pre('save', async function(next) {
  if (!this.customId) {
    // Generate ID: LIST-YYYYMMDD-XXXX
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.customId = `LIST-${dateStr}-${random}`;
  }
  next();
});

// Indexes for better search performance
listingSchema.index({ 'location.coordinates': '2dsphere' });
listingSchema.index({ status: 1, createdAt: -1 });
listingSchema.index({ status: 1, price: 1 });
listingSchema.index({ status: 1, 'rating.average': -1 });
listingSchema.index({ status: 1, views: -1 });
listingSchema.index({ landlord: 1, createdAt: -1 });
listingSchema.index({ price: 1 });
listingSchema.index({ 'roomDetails.roomType': 1 });
listingSchema.index({ 'location.district': 1 });
listingSchema.index({ 'location.city': 1 });
listingSchema.index({ amenities: 1 });
listingSchema.index({ title: 'text', description: 'text' });
listingSchema.index({ createdAt: -1 });
// Note: customId already has an index from unique: true, no need to add it again

module.exports = mongoose.model('Listing', listingSchema);


