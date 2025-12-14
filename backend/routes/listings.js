const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Listing = require('../models/Listing');
const { auth, isLandlord } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

// Regex helper for search
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Ensure middleware has the array method
if (!uploadMiddleware || typeof uploadMiddleware.array !== 'function') {
  console.error('Upload middleware missing or invalid: array method not found');
}

const uploadArray = uploadMiddleware.array.bind(uploadMiddleware);

// --- HELPER TO EXTRACT URLS AFTER UPLOAD ---
// This takes the result from uploadToCloudinary (which returns objects with .path or .url)
const getMediaFromProcessedFiles = (files) => {
  const images = [];
  const videos = [];
  
  if (!files || !Array.isArray(files)) return { images, videos };

  files.forEach(file => {
    // We prefer .path, fallback to .url. 
    // Your upload.js sets both, so this is safe.
    const url = file.path || file.url; 
    
    if (!url) return;

    if (file.mimetype && file.mimetype.startsWith('video/')) {
      videos.push(url);
    } else if (file.resource_type === 'video') { 
      // Cloudinary specific check
      videos.push(url);
    } else {
      // Default to image
      images.push(url);
    }
  });

  return { images, videos };
};

// Get all listings with filters
router.get('/', async (req, res) => {
  try {
    const {
      search, minPrice, maxPrice, roomType, city, district,
      university, amenities, status = 'available', sort = '-createdAt',
      page = 1, limit = 20
    } = req.query;

    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const query = { status };

    if (search && search.trim()) {
      const searchTerm = escapeRegex(search.trim()).substring(0, 100);
      if (searchTerm.length > 0) {
        query.$or = [
          { title: { $regex: `^${searchTerm}`, $options: 'i' } },
          { 'location.district': { $regex: `^${searchTerm}`, $options: 'i' } }
        ];
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (roomType) query['roomDetails.roomType'] = roomType;

    if (city && city.trim()) {
      const cityTerm = escapeRegex(city.trim()).substring(0, 100);
      if (cityTerm.length > 0) query['location.city'] = { $regex: `^${cityTerm}`, $options: 'i' };
    }
    
    if (district && district.trim()) {
      const districtTerm = escapeRegex(district.trim()).substring(0, 100);
      if (districtTerm.length > 0) query['location.district'] = { $regex: `^${districtTerm}`, $options: 'i' };
    }

    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : amenities.split(',');
      if (amenitiesArray.length > 0) query.amenities = { $all: amenitiesArray };
    }

    if (university && university.trim()) {
      const universityTerm = escapeRegex(university.trim()).substring(0, 100);
      if (universityTerm.length > 0) query['location.nearbyUniversities.name'] = { $regex: `^${universityTerm}`, $options: 'i' };
    }

    let sortOption = '-createdAt';
    if (sort === 'price') sortOption = 'price';
    else if (sort === '-price') sortOption = '-price';
    else if (sort === 'rating') sortOption = '-rating.average';
    else if (sort === 'views') sortOption = '-views';
    else if (sort === 'newest') sortOption = '-createdAt';
    else if (sort === 'oldest') sortOption = 'createdAt';

    const listingsPromise = Listing.find(query)
      .select('_id title price customId location roomDetails.area roomDetails.roomType images landlord rating views createdAt')
      .populate('landlord', '_id name verifiedBadge')
      .sort(sortOption)
      .limit(safeLimit)
      .skip(skip)
      .lean()
      .maxTimeMS(1500);

    const countPromise = Listing.countDocuments(query).maxTimeMS(800);

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
    if (!res.headersSent) res.status(500).json({ error: 'Server error' });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = await Listing.findById(req.params.id)
      .populate('landlord', '_id name email phone avatar verifiedBadge')
      .lean()
      .maxTimeMS(2000);
    
    if (!listing) {
      if (!res.headersSent) return res.status(404).json({ error: 'Listing not found' });
      return;
    }

    Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec().catch(() => {});

    if (!res.headersSent) res.json({ listing });
  } catch (error) {
    console.error('❌ Error in listings route:', req.path, error.message);
    if (!res.headersSent) res.status(500).json({ error: 'Server error' });
  }
});

// Create listing (Landlord only)
router.post('/', auth, isLandlord, uploadArray('media', 10), async (req, res) => {
  try {
    // 1. Parse JSON data
    if (!req.body.data) return res.status(400).json({ error: 'Thiếu dữ liệu bài đăng.' });

    let listingData;
    try {
      listingData = JSON.parse(req.body.data);
    } catch (parseError) {
      return res.status(400).json({ error: 'Dữ liệu JSON không hợp lệ.' });
    }

    // 2. Validate basic fields
    if (!listingData.title || !listingData.description || !listingData.price) {
      return res.status(400).json({ error: 'Vui lòng điền tiêu đề, mô tả và giá.' });
    }
    
    // 3. HANDLE UPLOAD (Crucial Step)
    let processedFiles = [];
    if (req.files && req.files.length > 0) {
      try {
        // We MUST call this because your upload.js uses memory storage.
        // This converts the buffers into actual file paths (Cloudinary or Local).
        processedFiles = await uploadMiddleware.uploadToCloudinary(req.files, 'findroom/listings');
      } catch (uploadError) {
        console.error('Error uploading files:', uploadError);
        return res.status(500).json({ error: 'Lỗi upload file. Vui lòng thử lại.' });
      }
    }

    // 4. Sort URLs into images and videos
    const { images, videos } = getMediaFromProcessedFiles(processedFiles);

    if (images.length === 0 && videos.length === 0) {
      return res.status(400).json({ error: 'Vui lòng thêm ít nhất 1 ảnh hoặc video.' });
    }

    // 5. Create Listing
    if (listingData.location?.coordinates) {
      const coords = listingData.location.coordinates;
      if (coords.lat !== undefined && coords.lng !== undefined && !coords.type) {
        listingData.location.coordinates = {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        };
      }
    }

    const listing = new Listing({
      ...listingData,
      landlord: req.userId,
      images: images,
      videos: videos
    });

    await listing.save();

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Lỗi server.' });
    }
  }
});

// Update listing
router.put('/:id', auth, isLandlord, uploadArray('media', 10), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Listing not found' });

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Không tìm thấy bài đăng' });
    if (listing.landlord.toString() !== req.userId) return res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa' });

    let updates;
    if (req.body.data) {
      try {
        updates = JSON.parse(req.body.data);
      } catch (parseError) {
        return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
      }
    } else {
      updates = req.body;
    }

    // HANDLE UPLOAD
    let processedFiles = [];
    if (req.files && req.files.length > 0) {
      try {
        processedFiles = await uploadMiddleware.uploadToCloudinary(req.files, 'findroom/listings');
      } catch (uploadError) {
        console.error('Error uploading files:', uploadError);
        return res.status(500).json({ error: 'Lỗi upload file.' });
      }
    }
    
    if (processedFiles.length > 0) {
      const { images: newImages, videos: newVideos } = getMediaFromProcessedFiles(processedFiles);
      
      const existingImages = Array.isArray(listing.images) ? listing.images : [];
      const existingVideos = Array.isArray(listing.videos) ? listing.videos : [];

      if (newImages.length > 0) updates.images = [...existingImages, ...newImages];
      if (newVideos.length > 0) updates.videos = [...existingVideos, ...newVideos];
    }

    if (updates.location?.coordinates) {
      const coords = updates.location.coordinates;
      if (coords.lat !== undefined && coords.lng !== undefined && !coords.type) {
        updates.location.coordinates = {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        };
      }
    }

    Object.assign(listing, updates);
    await listing.save();

    res.json({ message: 'Cập nhật bài đăng thành công', listing });
  } catch (error) {
    console.error('Error updating listing:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Lỗi server.' });
    }
  }
});

// Delete listing
router.delete('/:id', auth, isLandlord, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Listing not found' });

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.landlord.toString() !== req.userId) return res.status(403).json({ error: 'Not authorized' });

    await listing.deleteOne();
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ error: 'Server error' });
  }
});

// Update listing status
router.patch('/:id/status', auth, isLandlord, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Listing not found' });
    const { status } = req.body;
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.landlord.toString() !== req.userId) return res.status(403).json({ error: 'Not authorized' });

    listing.status = status;
    await listing.save();
    res.json({ message: 'Listing status updated', listing });
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

/*const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Listing = require('../models/Listing');
const { auth, isLandlord } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');
const { separateMedia } = require('../utils/fileHelper');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

if (!uploadMiddleware || typeof uploadMiddleware.array !== 'function') {
  console.error('Upload middleware missing or invalid: array method not found');
}
if (!uploadMiddleware.uploadToCloudinary || typeof uploadMiddleware.uploadToCloudinary !== 'function') {
  console.warn('⚠️ uploadToCloudinary method not found on upload middleware');
}

const uploadArray = uploadMiddleware.array.bind(uploadMiddleware);
const uploadToCloudinary = uploadMiddleware.uploadToCloudinary || (() => Promise.resolve([]));

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

    if (search && search.trim()) {
      const searchTerm = escapeRegex(search.trim()).substring(0, 100);
      if (searchTerm.length > 0) {
        query.$or = [
          { title: { $regex: `^${searchTerm}`, $options: 'i' } },
          { 'location.district': { $regex: `^${searchTerm}`, $options: 'i' } }
        ];
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (roomType) {
      query['roomDetails.roomType'] = roomType;
    }

    if (city && city.trim()) {
      const cityTerm = escapeRegex(city.trim()).substring(0, 100);
      if (cityTerm.length > 0) {
        query['location.city'] = { $regex: `^${cityTerm}`, $options: 'i' };
      }
    }
    
    if (district && district.trim()) {
      const districtTerm = escapeRegex(district.trim()).substring(0, 100);
      if (districtTerm.length > 0) {
        query['location.district'] = { $regex: `^${districtTerm}`, $options: 'i' };
      }
    }

    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : amenities.split(',');
      if (amenitiesArray.length > 0) {
        query.amenities = { $all: amenitiesArray };
      }
    }

    if (university && university.trim()) {
      const universityTerm = escapeRegex(university.trim()).substring(0, 100);
      if (universityTerm.length > 0) {
        query['location.nearbyUniversities.name'] = { $regex: `^${universityTerm}`, $options: 'i' };
      }
    }

    let sortOption = '-createdAt';
    if (sort === 'price') sortOption = 'price';
    else if (sort === '-price') sortOption = '-price';
    else if (sort === 'rating') sortOption = '-rating.average';
    else if (sort === 'views') sortOption = '-views';
    else if (sort === 'newest') sortOption = '-createdAt';
    else if (sort === 'oldest') sortOption = 'createdAt';

    const listingsPromise = Listing.find(query)
      .select('_id title price customId location roomDetails.area roomDetails.roomType images landlord rating views createdAt')
      .populate('landlord', '_id name verifiedBadge')
      .sort(sortOption)
      .limit(safeLimit)
      .skip(skip)
      .lean()
      .maxTimeMS(1500);

    const countPromise = Listing.countDocuments(query).maxTimeMS(800);

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

// Get landlord's listings
router.get('/landlord/:landlordId', async (req, res) => {
  try {
    const listings = await Listing.find({ 
      landlord: req.params.landlordId 
    })
      .select('_id title price customId location roomDetails.area roomDetails.roomType images landlord rating views createdAt status')
      .populate('landlord', '_id name verifiedBadge')
      .sort('-createdAt')
      .limit(100)
      .lean()
      .maxTimeMS(1500);

    if (!res.headersSent) {
      res.json({ listings: listings || [] });
    }
  } catch (error) {
    console.error('❌ Error in listings route:', req.path, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = await Listing.findById(req.params.id)
      .populate('landlord', '_id name email phone avatar verifiedBadge')
      .lean()
      .maxTimeMS(2000);
    
    if (!listing) {
      if (!res.headersSent) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      return;
    }

    Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })
      .exec()
      .catch(err => console.error('View increment error:', err.message));

    if (!res.headersSent) {
      res.json({ listing });
    }
  } catch (error) {
    console.error('❌ Error in listings route:', req.path, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Create listing (Landlord only)
router.post('/', auth, isLandlord, uploadArray('media', 10), async (req, res) => {
  try {
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

    if (!listingData.title || !listingData.description || !listingData.price) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin: tiêu đề, mô tả và giá thuê.' });
    }

    if (!listingData.location || !listingData.location.address || !listingData.location.coordinates) {
      return res.status(400).json({ error: 'Vui lòng chọn vị trí trên bản đồ.' });
    }

    if (!listingData.roomDetails || !listingData.roomDetails.area) {
      return res.status(400).json({ error: 'Vui lòng nhập diện tích phòng.' });
    }
    
    let processedFiles = [];
    const files = Array.isArray(req.files) ? req.files : (req.files ? [req.files] : []);
    
    if (files.length > 0) {
      try {
        processedFiles = await uploadToCloudinary(files, 'findroom/listings');
      } catch (uploadError) {
        console.error('Error uploading files to Cloudinary:', uploadError);
        return res.status(500).json({ error: 'Lỗi upload file. Vui lòng thử lại.' });
      }
    }
    
    const mediaResult = separateMedia(processedFiles || []);
    const images = Array.isArray(mediaResult.images) ? mediaResult.images : [];
    const videos = Array.isArray(mediaResult.videos) ? mediaResult.videos : [];

    if (images.length === 0 && videos.length === 0) {
      return res.status(400).json({ error: 'Vui lòng thêm ít nhất 1 ảnh hoặc video.' });
    }

    if (listingData.location?.coordinates) {
      const coords = listingData.location.coordinates;
      if (coords.lat !== undefined && coords.lng !== undefined && !coords.type) {
        listingData.location.coordinates = {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        };
      }
    }

    const listing = new Listing({
      ...listingData,
      landlord: req.userId,
      images: images,
      videos: videos
    });

    await listing.save();

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
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
router.put('/:id', auth, isLandlord, uploadArray('media', 10), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Không tìm thấy bài đăng' });
    }

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

    let processedFiles = [];
    const files = Array.isArray(req.files) ? req.files : (req.files ? [req.files] : []);
    
    if (files.length > 0) {
      try {
        processedFiles = await uploadToCloudinary(files, 'findroom/listings');
      } catch (uploadError) {
        console.error('Error uploading files to Cloudinary:', uploadError);
        return res.status(500).json({ error: 'Lỗi upload file. Vui lòng thử lại.' });
      }
    }
    
    if (processedFiles.length > 0) {
      const mediaResult = separateMedia(processedFiles);
      const newImages = Array.isArray(mediaResult.images) ? mediaResult.images : [];
      const newVideos = Array.isArray(mediaResult.videos) ? mediaResult.videos : [];

      const existingImages = Array.isArray(listing.images) ? listing.images : [];
      const existingVideos = Array.isArray(listing.videos) ? listing.videos : [];

      if (newImages.length > 0) {
        updates.images = [...existingImages, ...newImages];
      }
      if (newVideos.length > 0) {
        updates.videos = [...existingVideos, ...newVideos];
      }
    }

    if (updates.location?.coordinates) {
      const coords = updates.location.coordinates;
      if (coords.lat !== undefined && coords.lng !== undefined && !coords.type) {
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Listing not found' });
    }

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const { keyword } = req.body;
    if (!keyword || !keyword.trim()) {
      return res.json({ message: 'Keyword tracked' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.json({ message: 'Keyword tracked' });
    }

    listing.searchKeywords = listing.searchKeywords || [];
    const existingKeyword = listing.searchKeywords.find(k => k.keyword === keyword.trim());
    
    if (existingKeyword) {
      existingKeyword.count += 1;
    } else {
      listing.searchKeywords.push({ keyword: keyword.trim(), count: 1 });
    }
    
    await listing.save();

    res.json({ message: 'Keyword tracked' });
  } catch (error) {
    console.error('❌ Error in listings route:', req.path, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

module.exports = router;
*/