const express = require('express');
const router = express.Router();
const multer = require('multer');
const Listing = require('../models/Listing');
const { auth, isLandlord } = require('../middleware/auth');
//const upload = require('../middleware/upload');

const storage = multer.memoryStorage();
const upload = multer({ storage });

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
      amenities, // Comma-separated string
      status = 'available',
      sort = '-createdAt', // -createdAt, price, -price, -rating.average, -views
      page = 1,
      limit = 20
    } = req.query;

    const query = { status };

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.district': { $regex: search, $options: 'i' } }
      ];
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Room type
    if (roomType) {
      query['roomDetails.roomType'] = roomType;
    }

    // Location
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }
    if (district) {
      query['location.district'] = { $regex: district, $options: 'i' };
    }

    // Amenities filter (array)
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : amenities.split(',');
      query.amenities = { $all: amenitiesArray };
    }

    // Nearby university
    if (university) {
      query['location.nearbyUniversities.name'] = { $regex: university, $options: 'i' };
    }

    // Sort options
    let sortOption = '-createdAt';
    if (sort === 'price') sortOption = 'price';
    else if (sort === '-price') sortOption = '-price';
    else if (sort === 'rating') sortOption = '-rating.average';
    else if (sort === 'views') sortOption = '-views';
    else if (sort === 'newest') sortOption = '-createdAt';
    else if (sort === 'oldest') sortOption = 'createdAt';

    const listings = await Listing.find(query)
      .populate('landlord', '_id name avatar verifiedBadge')
      .sort(sortOption)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Listing.countDocuments(query);

    const listingsWithImages = listings.map(l => {
      const obj = l.toObject();
      return {
        ...obj,
        images: Array.isArray(obj.images) ? obj.images : [],
      };
    });
      

    res.json({
      listings: listingsWithImages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('landlord', '_id name email phone avatar verifiedBadge');
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Increment views
    listing.views += 1;
    
    // Update views history
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const viewToday = listing.viewsHistory.find(v => 
      v.date.getTime() === today.getTime()
    );
    
    if (viewToday) {
      viewToday.count += 1;
    } else {
      listing.viewsHistory.push({ date: today, count: 1 });
    }
    
    await listing.save();

    res.json({ listing });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
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
    
    // Process uploaded files
    const images = [];
    const videos = [];
    
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const filePath = `/uploads/${file.filename}`;
        if (file.mimetype.startsWith('image')) {
          images.push(file.filename);
        } else if (file.mimetype.startsWith('video')) {
          videos.push(filePath);
        }
      });
    }

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
      images,
      videos
    });

    await listing.save();

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    
    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }

    res.status(500).json({ 
      error: error.message || 'Lỗi server. Vui lòng thử lại sau.' 
    });
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

    // Process new uploaded files
    if (req.files && req.files.length > 0) {
      const newImages = [];
      const newVideos = [];
      
      req.files.forEach(file => {
        const filePath = `/uploads/${file.filename}`;
        if (file.mimetype.startsWith('image')) {
          newImages.push(filePath);
        } else if (file.mimetype.startsWith('video')) {
          newVideos.push(filePath);
        }
      });

      if (newImages.length > 0) {
        updates.images = [...(listing.images || []), ...newImages];
      }
      if (newVideos.length > 0) {
        updates.videos = [...(listing.videos || []), ...newVideos];
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

    res.json({
      message: 'Cập nhật bài đăng thành công',
      listing
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    
    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }

    res.status(500).json({ 
      error: error.message || 'Lỗi server. Vui lòng thử lại sau.' 
    });
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
    res.status(500).json({ error: 'Server error' });
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
    res.status(500).json({ error: 'Server error' });
  }
});

// Track search keyword
/*
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
    res.status(500).json({ error: 'Server error' });
  }
});*/
router.post('/create', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'listings' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Create listing
    const newListing = new Listing({
      ...req.body,
      imageUrl: result.secure_url,
      imagePublicId: result.public_id
    });

    await newListing.save();
    res.json({ message: 'Listing created successfully', listing: newListing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;





