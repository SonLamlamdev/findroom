const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { auth, isLandlord } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all listings with filters
router.get('/', async (req, res) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      roomType,
      city,
      district,
      university,
      amenities,
      status = 'available',
      sort = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;

    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const query = { status };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.district': { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (roomType) {
      query['roomDetails.roomType'] = roomType;
    }

    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }
    if (district) {
      query['location.district'] = { $regex: district, $options: 'i' };
    }

    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : amenities.split(',');
      query.amenities = { $all: amenitiesArray };
    }

    if (university) {
      query['location.nearbyUniversities.name'] = { $regex: university, $options: 'i' };
    }

    let sortOption = '-createdAt';
    if (sort === 'price') sortOption = 'price';
    else if (sort === '-price') sortOption = '-price';
    else if (sort === 'rating') sortOption = '-rating.average';
    else if (sort === 'views') sortOption = '-views';
    else if (sort === 'newest') sortOption = '-createdAt';
    else if (sort === 'oldest') sortOption = 'createdAt';

    const listingsPromise = Listing.find(query)
      .select('_id title price deposit location roomDetails amenities utilities images videos rules availableFrom status featured verified views saves rating landlord createdAt updatedAt')
      .populate('landlord', '_id name avatar verifiedBadge')
      .sort(sortOption)
      .limit(safeLimit)
      .skip(skip)
      .lean()
      .maxTimeMS(800);

    const countPromise = Listing.countDocuments(query).maxTimeMS(400);

    const [listings, total] = await Promise.all([listingsPromise, countPromise]);

    if (!res.headersSent) {
      res.json({
        listings: listings || [],
        pagination: {
          page: safePage,
          limit: safeLimit,
          total: total || 0,
          pages: Math.ceil((total || 0) / safeLimit)
        }
      });
    }
  } catch (error) {
    console.error('❌ Error fetching listings:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('landlord', '_id name email phone avatar verifiedBadge')
      .lean()
      .maxTimeMS(1000);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Increment views (non-blocking update)
    Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })
      .exec()
      .catch(err => console.error('View increment error:', err.message));

    res.json({ listing });
  } catch (error) {
    console.error('❌ Error in listings route:', req.path, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Create listing (Landlord only)
router.post('/', auth, isLandlord, upload.array('media', 10), async (req, res) => {
  try {
    // Validate that data exists
    if (!req.body.data) {
      return res.status(400).json({ error: 'Thiếu dữ liệu bài đăng. Vui lòng kiểm tra lại form.' });
    }

    let listingData;
    try {
      listingData = JSON.parse(req.body.data);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ. Vui lòng thử lại.' });
    }

    // Validate required fields
    if (!listingData.title || !listingData.description || !listingData.price) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin: tiêu đề, mô tả và giá thuê.' });
    }

    if (!listingData.location || !listingData.location.address || !listingData.location.coordinates) {
      return res.status(400).json({ error: 'Vui lòng chọn vị trí trên bản đồ.' });
    }

    if (!listingData.roomDetails || !listingData.roomDetails.area) {
      return res.status(400).json({ error: 'Vui lòng nhập diện tích phòng.' });
    }
    
    // Upload files to Cloudinary in parallel
    const upload = require('../middleware/upload');
    let processedFiles = [];
    const files = Array.isArray(req.files) ? req.files : (req.files ? [req.files] : []);
    
    if (files.length > 0) {
      try {
        processedFiles = await upload.uploadToCloudinary(files, 'findroom/listings');
      } catch (uploadError) {
        console.error('Error uploading files to Cloudinary:', uploadError);
        if (!res.headersSent) {
          return res.status(500).json({ error: 'Lỗi upload file. Vui lòng thử lại.' });
        }
        return;
      }
    }
    
    // Process uploaded files
    const { separateMedia } = require('../utils/fileHelper');
    const mediaResult = separateMedia(processedFiles || []);
    const images = Array.isArray(mediaResult.images) ? mediaResult.images : [];
    const videos = Array.isArray(mediaResult.videos) ? mediaResult.videos : [];

    // Validate that at least one image is uploaded
    if (images.length === 0 && videos.length === 0) {
      return res.status(400).json({ error: 'Vui lòng thêm ít nhất 1 ảnh hoặc video.' });
    }

    // Convert coordinates from {lat, lng} to GeoJSON format {type: 'Point', coordinates: [lng, lat]}
    if (listingData.location?.coordinates) {
      const coords = listingData.location.coordinates;
      if (coords.lat !== undefined && coords.lng !== undefined) {
        // Convert to GeoJSON format: [longitude, latitude]
        listingData.location.coordinates = {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        };
      }
    }

    const listing = new Listing({
      ...listingData,
      landlord: req.userId,
      images: images || [],
      videos: videos || []
    });

    await listing.save();

    if (!res.headersSent) {
      res.status(201).json({
        message: 'Listing created successfully',
        listing
      });
    }
  } catch (error) {
    console.error('Error creating listing:', error);
    
    if (!res.headersSent) {
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ error: errors.join(', ') });
      }
      res.status(500).json({ 
        error: error.message || 'Lỗi server. Vui lòng thử lại sau.' 
      });
    }
  }
});

// Update listing
router.put('/:id', auth, isLandlord, upload.array('media', 10), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Không tìm thấy bài đăng' });
    }

    // Check ownership
    if (listing.landlord.toString() !== req.userId) {
      return res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa bài đăng này' });
    }

    let updates;
    if (req.body.data) {
      try {
        updates = JSON.parse(req.body.data);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return res.status(400).json({ error: 'Dữ liệu không hợp lệ. Vui lòng thử lại.' });
      }
    } else {
      updates = req.body;
    }

    // Upload new files to Cloudinary in parallel
    let processedFiles = [];
    const files = Array.isArray(req.files) ? req.files : (req.files ? [req.files] : []);
    
    if (files.length > 0) {
      try {
        const upload = require('../middleware/upload');
        processedFiles = await upload.uploadToCloudinary(files, 'findroom/listings');
      } catch (uploadError) {
        console.error('Error uploading files to Cloudinary:', uploadError);
        if (!res.headersSent) {
          return res.status(500).json({ error: 'Lỗi upload file. Vui lòng thử lại.' });
        }
        return;
      }
    }
    
    // Process new uploaded files
    if (processedFiles.length > 0) {
      const { separateMedia } = require('../utils/fileHelper');
      const mediaResult = separateMedia(processedFiles);
      const newImages = Array.isArray(mediaResult.images) ? mediaResult.images : [];
      const newVideos = Array.isArray(mediaResult.videos) ? mediaResult.videos : [];

      if (newImages.length > 0) {
        updates.images = [...(Array.isArray(listing.images) ? listing.images : []), ...newImages];
      }
      if (newVideos.length > 0) {
        updates.videos = [...(Array.isArray(listing.videos) ? listing.videos : []), ...newVideos];
      }
    }

    // Convert coordinates from {lat, lng} to GeoJSON format if coordinates are being updated
    if (updates.location?.coordinates) {
      const coords = updates.location.coordinates;
      if (coords.lat !== undefined && coords.lng !== undefined) {
        // Convert to GeoJSON format: [longitude, latitude]
        updates.location.coordinates = {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        };
      }
    }

    Object.assign(listing, updates);
    await listing.save();

    if (!res.headersSent) {
      res.json({
        message: 'Cập nhật bài đăng thành công',
        listing
      });
    }
  } catch (error) {
    console.error('Error updating listing:', error);
    
    if (!res.headersSent) {
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ error: errors.join(', ') });
      }
      res.status(500).json({ 
        error: error.message || 'Lỗi server. Vui lòng thử lại sau.' 
      });
    }
  }
});

// Delete listing
router.delete('/:id', auth, isLandlord, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check ownership
    if (listing.landlord.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await listing.deleteOne();

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('❌ Error in listings route:', req.path, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Update listing status (hide/show)
router.patch('/:id/status', auth, isLandlord, async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.landlord.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    listing.status = status;
    await listing.save();

    res.json({ message: 'Listing status updated', listing });
  } catch (error) {
    console.error('❌ Error in listings route:', req.path, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Track search keyword
router.post('/:id/track-keyword', async (req, res) => {
  try {
    const { keyword } = req.body;
    const listing = await Listing.findById(req.params.id);
    
    if (listing && keyword) {
      const existingKeyword = listing.searchKeywords.find(k => k.keyword === keyword);
      
      if (existingKeyword) {
        existingKeyword.count += 1;
      } else {
        listing.searchKeywords.push({ keyword, count: 1 });
      }
      
      await listing.save();
    }

    res.json({ message: 'Keyword tracked' });
  } catch (error) {
    console.error('❌ Error in listings route:', req.path, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Get landlord's listings
router.get('/landlord/:landlordId', async (req, res) => {
  try {
    const listings = await Listing.find({ 
      landlord: req.params.landlordId 
    })
      .select('-searchKeywords -viewsHistory')
      .sort('-createdAt')
      .limit(100)
      .lean()
      .maxTimeMS(1000);

    res.json({ listings });
  } catch (error) {
    console.error('❌ Error in listings route:', req.path, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

module.exports = router;





