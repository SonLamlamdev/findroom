const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { auth, isLandlord } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');
const { separateMedia } = require('../utils/fileHelper');

/* =====================================================
   GET: Landlord listings (PHẢI ĐỂ TRƯỚC /:id)
===================================================== */
router.get('/landlord/:landlordId', async (req, res) => {
  try {
    const listings = await Listing.find({
      landlord: req.params.landlordId
    })
      .select('_id title price customId location roomDetails images rating views createdAt status')
      .sort('-createdAt')
      .limit(100)
      .lean()
      .maxTimeMS(500);

    const transformed = (listings || []).map(l => ({
      ...l,
      images: l.images?.[0] ? [l.images[0]] : []
    }));

    res.json({ listings: transformed });
  } catch (err) {
    console.error('❌ landlord listings error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* =====================================================
   GET: All listings (OPTIMIZED – NO TIMEOUT)
===================================================== */
router.get('/', async (req, res) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      roomType,
      city,
      district,
      status = 'available',
      sort = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;

    const safeLimit = Math.min(Math.max(+limit || 20, 1), 50);
    const safePage = Math.max(+page || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const query = { status };

    if (search && search.length >= 3) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = +minPrice;
      if (maxPrice) query.price.$lte = +maxPrice;
    }

    if (roomType) query['roomDetails.roomType'] = roomType;
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (district) query['location.district'] = { $regex: district, $options: 'i' };

    const listings = await Listing.find(query)
      .select('_id title price customId location roomDetails images rating views createdAt')
      .sort(sort)
      .limit(safeLimit)
      .skip(skip)
      .lean()
      .maxTimeMS(500);

    const transformed = (listings || []).map(l => ({
      ...l,
      images: l.images?.[0] ? [l.images[0]] : []
    }));

    res.json({
      listings: transformed,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: null, // ❌ KHÔNG count → tránh timeout
        pages: null
      }
    });
  } catch (err) {
    console.error('❌ get listings error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* =====================================================
   GET: Single listing
===================================================== */
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('landlord', '_id name phone avatar verifiedBadge')
      .lean()
      .maxTimeMS(800);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // tăng view không block
    Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).catch(() => {});

    res.json({ listing });
  } catch (err) {
    console.error('❌ get listing error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* =====================================================
   POST: Create listing
===================================================== */
router.post(
  '/',
  auth,
  isLandlord,
  uploadMiddleware.array('media', 10),
  async (req, res) => {
    try {
      if (!req.body.data) {
        return res.status(400).json({ error: 'Thiếu dữ liệu bài đăng' });
      }

      const data = JSON.parse(req.body.data);

      if (!data.title || !data.description || !data.price) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
      }

      let uploaded = [];
      if (req.files?.length) {
        uploaded = await uploadMiddleware.uploadToCloudinary(
          req.files,
          'findroom/listings'
        );
      }

      const media = separateMedia(uploaded);
      if (!media.images?.length && !media.videos?.length) {
        return res.status(400).json({ error: 'Cần ít nhất 1 ảnh hoặc video' });
      }

      if (data.location?.coordinates?.lat != null) {
        data.location.coordinates = {
          type: 'Point',
          coordinates: [
            data.location.coordinates.lng,
            data.location.coordinates.lat
          ]
        };
      }

      const listing = await Listing.create({
        ...data,
        landlord: req.userId,
        images: media.images || [],
        videos: media.videos || []
      });

      res.status(201).json({ message: 'Created', listing });
    } catch (err) {
      console.error('❌ create listing error:', err.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

/* =====================================================
   PUT: Update listing
===================================================== */
router.put(
  '/:id',
  auth,
  isLandlord,
  uploadMiddleware.array('media', 10),
  async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) return res.status(404).json({ error: 'Not found' });
      if (listing.landlord.toString() !== req.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const updates = req.body.data ? JSON.parse(req.body.data) : req.body;

      if (req.files?.length) {
        const uploaded = await uploadMiddleware.uploadToCloudinary(
          req.files,
          'findroom/listings'
        );
        const media = separateMedia(uploaded);

        updates.images = [...(listing.images || []), ...(media.images || [])];
        updates.videos = [...(listing.videos || []), ...(media.videos || [])];
      }

      if (updates.location?.coordinates?.lat != null) {
        updates.location.coordinates = {
          type: 'Point',
          coordinates: [
            updates.location.coordinates.lng,
            updates.location.coordinates.lat
          ]
        };
      }

      Object.assign(listing, updates);
      await listing.save();

      res.json({ message: 'Updated', listing });
    } catch (err) {
      console.error('❌ update listing error:', err.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

/* =====================================================
   DELETE
===================================================== */
router.delete('/:id', auth, isLandlord, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    if (listing.landlord.toString() !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await listing.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('❌ delete listing error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;




