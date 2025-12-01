const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['tenant', 'landlord', 'admin'],
    default: 'tenant'
  },
  phone: {
    type: String
  },
  avatar: {
    type: String,
    default: ''
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBadge: {
    type: Boolean,
    default: false
  },
  isHuman: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String
  },
  // For roommate matching
  roommateProfile: {
    university: String,
    major: String,
    habits: {
      sleepSchedule: String, // 'early', 'late', 'flexible'
      cleanliness: Number, // 1-5
      noise: String, // 'quiet', 'moderate', 'social'
      smoking: Boolean,
      pets: Boolean,
      cooking: String // 'often', 'sometimes', 'rarely'
    },
    interests: [String],
    budget: {
      min: Number,
      max: Number
    },
    specialNeeds: String,
    bio: String,
    lookingForRoommate: {
      type: Boolean,
      default: false
    }
  },
  savedListings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  }],
  stayedListings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  }],
  savedRoommates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
    default: ''
  },
  preferences: {
    language: {
      type: String,
      default: 'vi'
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  // Trust score cho flood reports (tăng khi report được xác nhận)
  floodReportTrustScore: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);


