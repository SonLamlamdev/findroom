const mongoose = require('mongoose');

const floodReportSchema = new mongoose.Schema({
  user: {
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
  radius: {
    type: Number,
    default: 500 // meters
  },
  level: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  // Mức độ ngập chi tiết
  floodDepth: {
    type: String,
    enum: ['ankle', 'knee', 'bike_seat'], // Mắt cá, Đầu gối, Yên xe
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  verified: {
    type: Boolean,
    default: false
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Xác nhận đã rút nước
  resolvedVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // H3 hexagon index để nhóm reports
  h3Index: {
    type: String
  },
  // Trust score của user khi tạo report
  userTrustScore: {
    type: Number,
    default: 1
  },
  // Tổng trust score của report (tính từ userTrustScore)
  totalTrustScore: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'false_alarm'],
    default: 'active'
  },
  resolvedAt: Date,
  // TTL - thời gian hết hạn (mặc định 30 phút)
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 60 * 1000); // 30 phút
    }
  }
}, {
  timestamps: true
});

// Index for geospatial queries
floodReportSchema.index({ 'location.coordinates': '2dsphere' });
floodReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('FloodReport', floodReportSchema);

