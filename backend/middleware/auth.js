const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Account has been banned', reason: user.banReason });
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const isLandlord = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.role !== 'landlord' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Landlord role required.' });
    }
    next();
  } catch (error) {
    console.error('❌ isLandlord middleware error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next();
  } catch (error) {
    console.error('❌ isAdmin middleware error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { auth, isLandlord, isAdmin };








