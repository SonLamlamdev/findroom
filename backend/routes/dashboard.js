const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const Review = require('../models/Review');
const User = require('../models/User');
const { auth, isLandlord } = require('../middleware/auth');

// Get landlord dashboard statistics
router.get('/stats', auth, isLandlord, async (req, res) => {
  try {
    const { period = 'month' } = req.query; // week, month, year
    
    // Get landlord's listings
    const listings = await Listing.find({ landlord: req.userId })
      .select('_id title price location viewsHistory searchKeywords')
      .lean()
      .maxTimeMS(1000);
    
    const listingIds = listings.map(l => l._id);

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch(period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default: // month
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Total views in period
    let totalViews = 0;
    const viewsByListing = [];

    listings.forEach(listing => {
      const periodViews = (listing.viewsHistory || [])
        .filter(v => new Date(v.date) >= startDate)
        .reduce((sum, v) => sum + (v.count || 0), 0);
      
      totalViews += periodViews;
      
      viewsByListing.push({
        listingId: listing._id,
        title: listing.title,
        views: periodViews
      });
    });

    const sampleListing = listings[0];

    // Parallel queries
    const [savedByUsers, reviews, areaListings] = await Promise.all([
      User.find({
        savedListings: { $in: listingIds }
      })
        .select('savedListings')
        .lean()
        .maxTimeMS(1000),
      Review.find({ listing: { $in: listingIds } })
        .select('rating.overall landlordResponse')
        .lean()
        .maxTimeMS(1000),
      sampleListing ? Listing.find({
        'location.city': sampleListing.location.city,
        'location.district': sampleListing.location.district,
        status: 'available'
      })
        .select('price')
        .lean()
        .maxTimeMS(1000) : Promise.resolve([])
    ]);

    // Total saves
    const totalSaves = savedByUsers.reduce((count, user) => {
      return count + user.savedListings.filter(id => 
        listingIds.some(listingId => listingId.toString() === id.toString())
      ).length;
    }, 0);

    // Average price comparison
    const landlordAvgPrice = listings.reduce((sum, l) => sum + (l.price || 0), 0) / listings.length || 0;
    const areaAvgPrice = areaListings.length > 0 
      ? areaListings.reduce((sum, l) => sum + (l.price || 0), 0) / areaListings.length 
      : 0;

    // Top search keywords
    const allKeywords = [];
    listings.forEach(listing => {
      (listing.searchKeywords || []).forEach(kw => {
        const existing = allKeywords.find(k => k.keyword === kw.keyword);
        if (existing) {
          existing.count += kw.count || 0;
        } else {
          allKeywords.push({ keyword: kw.keyword, count: kw.count || 0 });
        }
      });
    });
    
    const topKeywords = allKeywords
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Reviews statistics
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + (r.rating?.overall || 0), 0) / reviews.length 
      : 0;

    // Response rate
    const responsesCount = reviews.filter(r => r.landlordResponse).length;
    const responseRate = reviews.length > 0 ? (responsesCount / reviews.length) * 100 : 0;

    res.json({
      period,
      totalListings: listings.length,
      activeListings: listings.filter(l => l.status === 'available').length,
      totalViews,
      viewsByListing,
      totalSaves,
      priceComparison: {
        yourAverage: Math.round(landlordAvgPrice),
        areaAverage: Math.round(areaAvgPrice),
        difference: Math.round(landlordAvgPrice - areaAvgPrice),
        percentageDiff: areaAvgPrice > 0 
          ? Math.round(((landlordAvgPrice - areaAvgPrice) / areaAvgPrice) * 100)
          : 0
      },
      topKeywords,
      reviews: {
        total: reviews.length,
        averageRating: avgRating.toFixed(1),
        responseRate: responseRate.toFixed(1)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get detailed analytics for a specific listing
router.get('/listing/:id/analytics', auth, isLandlord, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .select('_id landlord views viewsHistory searchKeywords rating')
      .lean()
      .maxTimeMS(500);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.landlord.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Views over time (last 30 days)
    const viewsTimeline = (listing.viewsHistory || [])
      .slice(-30)
      .map(v => ({
        date: v.date,
        count: v.count
      }));

    // Get save count
    const saveCount = await User.countDocuments({
      savedListings: listing._id
    }).maxTimeMS(500);

    res.json({
      listingId: listing._id,
      totalViews: listing.views || 0,
      viewsTimeline,
      saveCount,
      searchKeywords: listing.searchKeywords || [],
      rating: listing.rating || { average: 0, count: 0 }
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

module.exports = router;








