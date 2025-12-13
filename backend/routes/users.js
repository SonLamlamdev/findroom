const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { auth, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('❌ Error in route:', req.path, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Update user profile
router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
  try {
    const updates = req.body;
    
    if (req.file) {
      const { getFileUrl } = require('../utils/fileHelper');
      updates.avatar = getFileUrl(req.file) || `/uploads/${req.file.filename}`;
    }

    // Don't allow updating sensitive fields
    delete updates.password;
    delete updates.role;
    delete updates.verified;
    delete updates.isBanned;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('❌ Error in route:', req.path, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Update roommate profile
router.put('/roommate-profile', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { roommateProfile: req.body } },
      { new: true }
    ).select('-password');

    res.json({ message: 'Roommate profile updated successfully', user });
  } catch (error) {
    console.error('❌ Error in route:', req.path, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Update preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { language, theme } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { preferences: { language, theme } } },
      { new: true }
    ).select('-password');

    res.json({ message: 'Preferences updated successfully', user });
  } catch (error) {
    console.error('❌ Error in route:', req.path, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Save/unsave listing
router.post('/saved-listings/:listingId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const listingId = req.params.listingId;
    
    const index = user.savedListings.indexOf(listingId);
    
    if (index > -1) {
      user.savedListings.splice(index, 1);
      await user.save();
      res.json({ message: 'Listing removed from saved', saved: false });
    } else {
      user.savedListings.push(listingId);
      await user.save();
      res.json({ message: 'Listing saved', saved: true });
    }
  } catch (error) {
    console.error('❌ Error in route:', req.path, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Get saved listings
router.get('/saved-listings', auth, async (req, res) => {
  try {
    // Validate userId exists
    if (!req.userId) {
      console.error('❌ No userId in request for saved-listings');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      console.error('❌ User not found for saved-listings:', req.userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If user has no saved listings, return empty array
    if (!user.savedListings || user.savedListings.length === 0) {
      return res.json({ listings: [] });
    }
    
    // Populate listings with error handling for each listing
    const listings = [];
    for (const listingId of user.savedListings) {
      try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(listingId)) {
          console.warn(`Skipping invalid ObjectId in saved listings: ${listingId}`);
          continue;
        }
        
        const listing = await Listing.findById(listingId)
          .populate('landlord', 'name avatar verifiedBadge')
          .lean();
        
        if (listing && listing.landlord) {
          listings.push(listing);
        } else if (listing) {
          // Listing exists but landlord was deleted, include it anyway
          listing.landlord = null;
          listings.push(listing);
        }
      } catch (listingError) {
        // Skip invalid/deleted listings
        console.warn(`Skipping invalid saved listing ${listingId}:`, listingError.message);
        continue;
      }
    }
    
    res.json({ listings });
  } catch (error) {
    console.error('❌ Error fetching saved listings:', {
      error: error.message,
      stack: error.stack,
      userId: req.userId
    });
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Mark listing as stayed (user đã từng ở)
router.post('/stayed-listings/:listingId', auth, async (req, res) => {
  try {
    const { stayedAt } = req.body; // Date when user stayed
    const user = await User.findById(req.userId);
    const listingId = req.params.listingId;
    
    const index = user.stayedListings.indexOf(listingId);
    
    if (index === -1) {
      user.stayedListings.push(listingId);
      await user.save();
      res.json({ 
        message: 'Listing marked as stayed', 
        stayed: true,
        stayedAt: stayedAt || new Date()
      });
    } else {
      res.json({ message: 'Listing already marked as stayed', stayed: true });
    }
  } catch (error) {
    console.error('❌ Error in route:', req.path, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Get stayed listings
router.get('/stayed-listings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If user has no stayed listings, return empty array
    if (!user.stayedListings || user.stayedListings.length === 0) {
      return res.json({ listings: [] });
    }
    
    // Populate listings with error handling for each listing
    const listings = [];
    for (const listingId of user.stayedListings) {
      try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(listingId)) {
          console.warn(`Skipping invalid ObjectId in stayed listings: ${listingId}`);
          continue;
        }
        
        const listing = await Listing.findById(listingId)
          .populate('landlord', 'name avatar verifiedBadge')
          .lean();
        
        if (listing && listing.landlord) {
          listings.push(listing);
        } else if (listing) {
          // Listing exists but landlord was deleted, include it anyway
          listing.landlord = null;
          listings.push(listing);
        }
      } catch (listingError) {
        // Skip invalid/deleted listings
        console.warn(`Skipping invalid listing ${listingId}:`, listingError.message);
        continue;
      }
    }
    
    res.json({ listings });
  } catch (error) {
    console.error('❌ Error fetching stayed listings:', {
      error: error.message,
      stack: error.stack,
      userId: req.userId
    });
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Ban user (Admin only)
router.post('/ban/:userId', auth, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { 
        isBanned: true,
        banReason: reason
      },
      { new: true }
    );

    res.json({ message: 'User banned successfully', user });
  } catch (error) {
    console.error('❌ Error in route:', req.path, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Unban user (Admin only)
router.post('/unban/:userId', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { 
        isBanned: false,
        banReason: null
      },
      { new: true }
    );

    res.json({ message: 'User unbanned successfully', user });
  } catch (error) {
    console.error('❌ Error in route:', req.path, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

module.exports = router;








