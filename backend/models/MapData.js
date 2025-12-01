const mongoose = require('mongoose');

const mapDataSchema = new mongoose.Schema({
  area: {
    type: String,
    required: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]]
    }
  },
  data: {
    averagePrice: Number,
    priceLevel: {
      type: Number,
      min: 1,
      max: 5
    },
    security: {
      level: {
        type: String,
        enum: ['safe', 'moderate', 'caution']
      },
      rating: Number,
      reports: Number
    },
    studentAmenities: {
      restaurants: Number,
      copyShops: Number,
      busStops: Number,
      convenience: Number,
      score: Number
    },
    floodRisk: {
      level: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      lastIncident: Date,
      description: String
    }
  },
  contributors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: Date
  }]
}, {
  timestamps: true
});

mapDataSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('MapData', mapDataSchema);








