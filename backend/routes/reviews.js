const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Listing = require('../models/Listing');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get reviews for a listing
router.get('/listing/:listingId', async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('reviewer', 'name avatar')
      .sort('-createdAt');

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create review
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const reviewData = req.body.data ? JSON.parse(req.body.data) : req.body;
    const User = require('../models/User');
    
    // Check if user has stayed at this listing
    const user = await User.findById(req.userId);
    const hasStayed = user.stayedListings.some(
      id => id.toString() === reviewData.listing
    );

    if (!hasStayed) {
      return res.status(403).json({ 
        error: 'Bạn chỉ có thể đánh giá phòng trọ mà bạn đã từng ở. Vui lòng đánh dấu phòng là "đã ở" trước khi đánh giá.' 
      });
    }
    
    // Check if user already reviewed this listing
    const existingReview = await Review.findOne({
      listing: reviewData.listing,
      reviewer: req.userId
    });

    if (existingReview) {
      return res.status(400).json({ error: 'Bạn đã đánh giá phòng trọ này rồi' });
    }

    // Validate stayedAt date
    if (!reviewData.stayedAt) {
      return res.status(400).json({ error: 'Vui lòng cung cấp ngày bạn đã ở phòng' });
    }

    // Process uploaded images
    const { getFileUrls } = require('../utils/fileHelper');
    const images = getFileUrls(req.files || []);

    const review = new Review({
      ...reviewData,
      reviewer: req.userId,
      stayedAt: new Date(reviewData.stayedAt),
      images
    });

    await review.save();

    // Update listing rating
    const listing = await Listing.findById(reviewData.listing);
    if (listing) {
      const allReviews = await Review.find({ listing: listing._id });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating.overall, 0) / allReviews.length;
      
      listing.rating = {
        average: avgRating,
        count: allReviews.length
      };
      
      await listing.save();
    }

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark review as helpful
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const userIndex = review.helpfulBy.indexOf(req.userId);
    
    if (userIndex > -1) {
      review.helpfulBy.splice(userIndex, 1);
      review.helpful = review.helpfulBy.length;
    } else {
      review.helpfulBy.push(req.userId);
      review.helpful = review.helpfulBy.length;
    }

    await review.save();

    res.json({ message: 'Updated', helpful: review.helpful });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Landlord response to review
router.post('/:id/response', auth, async (req, res) => {
  try {
    const { comment } = req.body;
    const review = await Review.findById(req.params.id).populate('listing');
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user is the landlord
    if (review.listing.landlord.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    review.landlordResponse = {
      comment,
      date: new Date()
    };

    await review.save();

    res.json({ message: 'Response added successfully', review });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;








