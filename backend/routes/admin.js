const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const Blog = require('../models/Blog');
const MapAnnotation = require('../models/MapAnnotation');
const FloodReport = require('../models/FloodReport');
const { auth, isAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(auth);
router.use(isAdmin);

// ========== USER MANAGEMENT ==========

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, role, search, isBanned } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isBanned !== undefined) query.isBanned = isBanned === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Ban user
router.post('/users/:userId/ban', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot ban admin users' });
    }

    user.isBanned = true;
    user.banReason = reason || 'Violation of terms of service';
    await user.save();

    res.json({ message: 'User banned successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unban user
router.post('/users/:userId/unban', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isBanned = false;
    user.banReason = undefined;
    await user.save();

    res.json({ message: 'User unbanned successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== LISTING MANAGEMENT ==========

// Get all listings
router.get('/listings', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const listings = await Listing.find(query)
      .populate('landlord', 'name email')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Listing.countDocuments(query);

    res.json({ listings, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete listing
router.delete('/listings/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    await Listing.findByIdAndDelete(listingId);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== BLOG MANAGEMENT ==========

// Get all blogs
router.get('/blogs', async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name email')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({ blogs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete blog
router.delete('/blogs/:blogId', async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    await Blog.findByIdAndDelete(blogId);

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== MAP DATA MANAGEMENT ==========

// Get all map annotations
router.get('/map-annotations', async (req, res) => {
  try {
    const { page = 1, limit = 50, type, status } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;

    const annotations = await MapAnnotation.find(query)
      .populate('landlord', 'name email')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await MapAnnotation.countDocuments(query);

    res.json({ annotations, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete map annotation
router.delete('/map-annotations/:annotationId', async (req, res) => {
  try {
    const { annotationId } = req.params;

    const annotation = await MapAnnotation.findById(annotationId);
    if (!annotation) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    await MapAnnotation.findByIdAndDelete(annotationId);

    res.json({ message: 'Annotation deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== FLOOD REPORTS MANAGEMENT ==========

// Get all flood reports
router.get('/flood-reports', async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const query = {};

    if (status) query.status = status;

    const reports = await FloodReport.find(query)
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await FloodReport.countDocuments(query);

    res.json({ reports, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Resolve flood report
router.post('/flood-reports/:reportId/resolve', async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await FloodReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    report.status = 'resolved';
    report.resolvedAt = new Date();
    await report.save();

    res.json({ message: 'Report resolved successfully', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== STATISTICS ==========

// Get dashboard statistics
router.get('/statistics', async (req, res) => {
  try {
    const [
      totalUsers,
      totalLandlords,
      totalTenants,
      totalListings,
      totalBlogs,
      totalAnnotations,
      totalFloodReports,
      bannedUsers,
      activeListings
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'landlord' }),
      User.countDocuments({ role: 'tenant' }),
      Listing.countDocuments(),
      Blog.countDocuments(),
      MapAnnotation.countDocuments(),
      FloodReport.countDocuments(),
      User.countDocuments({ isBanned: true }),
      Listing.countDocuments({ status: 'available' })
    ]);

    res.json({
      users: {
        total: totalUsers,
        landlords: totalLandlords,
        tenants: totalTenants,
        banned: bannedUsers
      },
      listings: {
        total: totalListings,
        active: activeListings
      },
      blogs: {
        total: totalBlogs
      },
      map: {
        annotations: totalAnnotations,
        floodReports: totalFloodReports
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== NOTIFICATIONS ==========

// Send notification to landlord about report
router.post('/notify-landlord/:landlordId', async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { message, type } = req.body;

    const landlord = await User.findById(landlordId);
    if (!landlord) {
      return res.status(404).json({ error: 'Landlord not found' });
    }

    // TODO: Create notification and emit via socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(landlordId).emit('notification', {
        type: type || 'report',
        message: message || 'Your listing has been reported',
        timestamp: new Date()
      });
    }

    res.json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

