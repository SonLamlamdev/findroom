const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const MapData = require('../models/MapData');
const MapAnnotation = require('../models/MapAnnotation');
const FloodReport = require('../models/FloodReport');
const Listing = require('../models/Listing');
const { auth, isLandlord } = require('../middleware/auth');

// Get map data for an area
router.get('/area-data', async (req, res) => {
  try {
    const { bounds, dataType } = req.query;
    
    // bounds format: [swLng, swLat, neLng, neLat]
    const query = {};
    
    if (bounds) {
      const [swLng, swLat, neLng, neLat] = bounds.split(',').map(Number);
      
      query.coordinates = {
        $geoWithin: {
          $box: [[swLng, swLat], [neLng, neLat]]
        }
      };
    }

    const mapData = await MapData.find(query);

    res.json({ mapData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get listings with coordinates for map display
router.get('/listings', async (req, res) => {
  try {
    const { bounds, minPrice, maxPrice, roomType } = req.query;
    const query = { status: 'available' };

    if (bounds) {
      const [swLng, swLat, neLng, neLat] = bounds.split(',').map(Number);
      
      query['location.coordinates'] = {
        $geoWithin: {
          $box: [[swLng, swLat], [neLng, neLat]]
        }
      };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (roomType) {
      query['roomDetails.roomType'] = roomType;
    }

    const listings = await Listing.find(query)
      .select('title price location images roomDetails rating')
      .limit(500);

    res.json({ listings });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update map data (community contribution)
router.post('/update-area', auth, async (req, res) => {
  try {
    const { area, coordinates, data } = req.body;

    let mapData = await MapData.findOne({ area });

    if (mapData) {
      // Update existing data
      Object.assign(mapData.data, data);
      mapData.contributors.push({
        user: req.userId,
        date: new Date()
      });
    } else {
      // Create new area data
      mapData = new MapData({
        area,
        coordinates,
        data,
        contributors: [{
          user: req.userId,
          date: new Date()
        }]
      });
    }

    await mapData.save();

    res.json({ message: 'Map data updated successfully', mapData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get heatmap data by type
router.get('/heatmap/:type', async (req, res) => {
  try {
    const { type } = req.params; // price, security, amenities, flood
    const { bounds } = req.query;

    let data;

    switch(type) {
      case 'price':
        // Get average prices by area
        const priceData = await MapData.find({})
          .select('area coordinates data.averagePrice data.priceLevel');
        data = priceData;
        break;

      case 'security':
        const securityData = await MapData.find({})
          .select('area coordinates data.security');
        data = securityData;
        break;

      case 'amenities':
        const amenitiesData = await MapData.find({})
          .select('area coordinates data.studentAmenities');
        data = amenitiesData;
        break;

      case 'flood':
        const floodData = await MapData.find({})
          .select('area coordinates data.floodRisk');
        data = floodData;
        break;

      default:
        return res.status(400).json({ error: 'Invalid heatmap type' });
    }

    res.json({ type, data });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get districts autocomplete (from existing listings)
router.get('/districts', async (req, res) => {
  try {
    const { query } = req.query;
    
    // Get unique districts from listings
    const districts = await Listing.distinct('location.district', {
      'location.district': { $exists: true, $ne: '' },
      status: 'available'
    });
    
    // Filter by query if provided
    let filteredDistricts = districts;
    if (query) {
      const queryLower = query.toLowerCase();
      filteredDistricts = districts.filter(d => 
        d && d.toLowerCase().includes(queryLower)
      );
    }
    
    // Sort and limit
    filteredDistricts = filteredDistricts
      .filter(d => d) // Remove null/undefined
      .sort()
      .slice(0, 20); // Limit to 20 suggestions
    
    res.json({ districts: filteredDistricts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== MAP ANNOTATIONS ==========

// Get map annotations
router.get('/annotations', async (req, res) => {
  try {
    const { type, bounds } = req.query;
    const query = { status: 'active' };
    
    if (type) {
      query.type = type;
    }
    
    if (bounds) {
      const [swLng, swLat, neLng, neLat] = bounds.split(',').map(Number);
      query['location.coordinates'] = {
        $geoWithin: {
          $box: [[swLng, swLat], [neLng, neLat]]
        }
      };
    }
    
    const annotations = await MapAnnotation.find(query)
      .populate('landlord', 'name email')
      .sort('-createdAt')
      .limit(100);
    
    res.json({ annotations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create map annotation (landlord only)
router.post('/annotations', auth, isLandlord, async (req, res) => {
  try {
    const { type, location, data } = req.body;
    
    if (!type || !['flood', 'price', 'security'].includes(type)) {
      return res.status(400).json({ error: 'Invalid annotation type' });
    }
    
    if (!location || !location.coordinates) {
      return res.status(400).json({ error: 'Location coordinates required' });
    }
    
    // Convert {lat, lng} to GeoJSON [lng, lat]
    const coords = location.coordinates;
    const geoJsonCoords = Array.isArray(coords) && coords.length === 2 
      ? [coords[0], coords[1]] // Assume already [lng, lat]
      : [coords.lng, coords.lat]; // Convert from {lat, lng}
    
    const annotation = new MapAnnotation({
      type,
      landlord: req.userId,
      location: {
        ...location,
        coordinates: {
          type: 'Point',
          coordinates: geoJsonCoords
        }
      },
      data
    });
    
    await annotation.save();
    await annotation.populate('landlord', 'name email');
    
    res.json({ annotation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Report annotation
router.post('/annotations/:id/report', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const annotation = await MapAnnotation.findById(req.params.id);
    
    if (!annotation) {
      return res.status(404).json({ error: 'Annotation not found' });
    }
    
    annotation.reports.push({
      user: req.userId,
      reason: reason || 'Inappropriate content'
    });
    
    await annotation.save();
    
    // TODO: Notify landlord via socket.io
    
    res.json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== FLOOD REPORTS ==========

// Get flood reports in radius
router.get('/flood-reports', async (req, res) => {
  try {
    const { lat, lng, radius = 1000 } = req.query; // radius in meters
    const now = new Date();
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }
    
    const reports = await FloodReport.find({
      status: 'active',
      expiresAt: { $gt: now }, // Chỉ lấy reports chưa hết hạn
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .limit(50);
    
    res.json({ reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create flood report
router.post('/flood-reports', auth, upload.single('images'), async (req, res) => {
  try {
    // Parse form data (có thể là JSON hoặc FormData)
    let location, radius, level, floodDepth, description, address;
    
    if (req.body.location) {
      // JSON format
      ({ location, radius, level, floodDepth, description } = req.body);
    } else {
      // FormData format
      location = {
        coordinates: {
          lat: parseFloat(req.body['location[coordinates][lat]']),
          lng: parseFloat(req.body['location[coordinates][lng]'])
        },
        address: req.body['location[address]'] || ''
      };
      radius = req.body.radius ? parseInt(req.body.radius) : 100;
      level = req.body.level;
      floodDepth = req.body.floodDepth;
      description = req.body.description;
      address = req.body['location[address]'] || '';
    }
    
    if (!location || !location.coordinates || !level || !floodDepth || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Convert {lat, lng} to GeoJSON [lng, lat]
    const coords = location.coordinates;
    const geoJsonCoords = Array.isArray(coords) && coords.length === 2 
      ? [coords[0], coords[1]]
      : [coords.lng, coords.lat];
    
    // Get user trust score
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    const userTrustScore = user?.floodReportTrustScore || 1;
    
    // Calculate H3 index (resolution 10 = ~50m hexagon)
    let h3Index = null;
    try {
      const h3 = require('h3-js');
      h3Index = h3.latLngToCell(geoJsonCoords[1], geoJsonCoords[0], 10);
    } catch (err) {
      console.warn('H3 library not available, skipping hexagon index');
    }
    
    // Handle uploaded image
    const images = [];
    if (req.file) {
      images.push(`/uploads/${req.file.filename}`);
    }
    
    const report = new FloodReport({
      user: req.userId,
      location: {
        address: address || location.address || '',
        coordinates: {
          type: 'Point',
          coordinates: geoJsonCoords
        }
      },
      radius: radius || 100,
      level,
      floodDepth,
      description,
      images,
      h3Index,
      userTrustScore,
      totalTrustScore: userTrustScore
    });
    
    await report.save();
    await report.populate('user', 'name avatar floodReportTrustScore');
    
    res.json({ report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Vote on flood report
router.post('/flood-reports/:id/vote', auth, async (req, res) => {
  try {
    const { vote } = req.body; // 'up' or 'down'
    const report = await FloodReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Remove existing votes from user
    report.upvotes = report.upvotes.filter(id => id.toString() !== req.userId.toString());
    report.downvotes = report.downvotes.filter(id => id.toString() !== req.userId.toString());
    
    // Add new vote
    if (vote === 'up') {
      report.upvotes.push(req.userId);
    } else if (vote === 'down') {
      report.downvotes.push(req.userId);
    }
    
    await report.save();
    
    res.json({ report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Resolve flood report (xác nhận đã rút nước)
router.post('/flood-reports/:id/resolve', auth, async (req, res) => {
  try {
    const report = await FloodReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Check if user already voted
    const alreadyVoted = report.resolvedVotes.some(
      v => v.user.toString() === req.userId.toString()
    );
    
    if (!alreadyVoted) {
      report.resolvedVotes.push({ user: req.userId });
      
      // Nếu có >= 3 người xác nhận đã rút, tự động resolve
      if (report.resolvedVotes.length >= 3) {
        report.status = 'resolved';
        report.resolvedAt = new Date();
      }
      
      await report.save();
    }
    
    await report.populate('resolvedVotes.user', 'name');
    
    res.json({ report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get flood zones (hexagon grid với trust score)
router.get('/flood-zones', async (req, res) => {
  try {
    const { bounds } = req.query;
    const now = new Date();
    
    // Lấy tất cả reports active chưa hết hạn (30 phút)
    const query = {
      status: 'active',
      expiresAt: { $gt: now }
    };
    
    if (bounds) {
      const [swLng, swLat, neLng, neLat] = bounds.split(',').map(Number);
      query['location.coordinates'] = {
        $geoWithin: {
          $box: [[swLng, swLat], [neLng, neLat]]
        }
      };
    }
    
    const reports = await FloodReport.find(query)
      .select('location coordinates h3Index totalTrustScore level floodDepth createdAt')
      .lean();
    
    // Nhóm reports theo H3 index
    const hexagonMap = new Map();
    
    reports.forEach(report => {
      if (!report.h3Index) return;
      
      const h3Index = report.h3Index;
      if (!hexagonMap.has(h3Index)) {
        hexagonMap.set(h3Index, {
          h3Index,
          reports: [],
          totalTrustScore: 0,
          maxLevel: 'low',
          maxFloodDepth: 'ankle',
          count: 0
        });
      }
      
      const hex = hexagonMap.get(h3Index);
      hex.reports.push(report);
      hex.totalTrustScore += report.totalTrustScore || 1;
      hex.count += 1;
      
      // Xác định mức độ cao nhất
      const levelOrder = { low: 1, medium: 2, high: 3 };
      if (levelOrder[report.level] > levelOrder[hex.maxLevel]) {
        hex.maxLevel = report.level;
      }
      
      const depthOrder = { ankle: 1, knee: 2, bike_seat: 3 };
      if (depthOrder[report.floodDepth] > depthOrder[hex.maxFloodDepth]) {
        hex.maxFloodDepth = report.floodDepth;
      }
    });
    
    // Chỉ trả về các hexagon có >= 3 reports hoặc totalTrustScore >= 10
    const activeZones = Array.from(hexagonMap.values())
      .filter(hex => hex.count >= 3 || hex.totalTrustScore >= 10);
    
    // Convert H3 index to polygon coordinates
    try {
      const h3 = require('h3-js');
      const zones = activeZones.map(hex => {
        const boundary = h3.cellToBoundary(hex.h3Index);
        const polygon = boundary.map(([lat, lng]) => [lng, lat]); // Convert to [lng, lat]
        
        return {
          ...hex,
          polygon,
          center: h3.cellToLatLng(hex.h3Index)
        };
      });
      
      res.json({ zones });
    } catch (err) {
      // Fallback nếu H3 không có
      res.json({ zones: activeZones });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function: Tính khoảng cách giữa 2 điểm (Haversine formula) - trả về mét
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Bán kính Trái Đất tính bằng mét
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper function: Kiểm tra 2 circle có giao nhau không
function circlesIntersect(lat1, lng1, radius1, lat2, lng2, radius2) {
  const distance = calculateDistance(lat1, lng1, lat2, lng2);
  return distance < (radius1 + radius2); // Giao nhau nếu khoảng cách < tổng 2 radius
}

// Get flood reports with radius clustering
router.get('/flood-reports-clustered', async (req, res) => {
  try {
    const { bounds } = req.query;
    const now = new Date();
    
    const query = {
      status: 'active',
      expiresAt: { $gt: now }
    };
    
    if (bounds) {
      const [swLng, swLat, neLng, neLat] = bounds.split(',').map(Number);
      query['location.coordinates'] = {
        $geoWithin: {
          $box: [[swLng, swLat], [neLng, neLat]]
        }
      };
    }
    
    const reports = await FloodReport.find(query)
      .populate('user', 'name avatar floodReportTrustScore')
      .sort('-createdAt')
      .limit(200);
    
    // Convert reports to plain objects và extract coordinates
    const reportsData = reports.map(report => {
      const coords = report.location.coordinates.coordinates; // GeoJSON format: [lng, lat]
      return {
        ...report.toObject(),
        _lat: coords[1], // latitude
        _lng: coords[0], // longitude
        _originalRadius: report.radius || 100
      };
    });
    
    // Nhóm các reports giao nhau lại với nhau
    const groups = [];
    const processed = new Set();
    
    reportsData.forEach(report => {
      if (processed.has(report._id.toString())) return;
      
      const group = [report];
      processed.add(report._id.toString());
      
      // Tìm tất cả reports giao nhau với report này
      let foundNew = true;
      while (foundNew) {
        foundNew = false;
        reportsData.forEach(otherReport => {
          if (processed.has(otherReport._id.toString())) return;
          
          // Kiểm tra xem otherReport có giao nhau với bất kỳ report nào trong group không
          const intersectsWithGroup = group.some(groupReport => {
            return circlesIntersect(
              groupReport._lat, groupReport._lng, groupReport._originalRadius,
              otherReport._lat, otherReport._lng, otherReport._originalRadius
            );
          });
          
          if (intersectsWithGroup) {
            group.push(otherReport);
            processed.add(otherReport._id.toString());
            foundNew = true;
          }
        });
      }
      
      groups.push(group);
    });
    
    // Mở rộng radius cho các reports trong nhóm có >= 2 reports
    const expandedReports = reportsData.map(report => {
      // Tìm nhóm chứa report này
      const group = groups.find(g => g.some(r => r._id.toString() === report._id.toString()));
      
      let expandedRadius = report._originalRadius;
      
      // Nếu nhóm có >= 2 reports, mở rộng radius
      if (group && group.length >= 2) {
        // Tính expansion factor dựa trên số lượng reports trong nhóm
        // 2 reports: 1.5x, 3-4 reports: 2x, >=5 reports: 2.5x
        let expansionFactor = 1.5;
        if (group.length >= 5) {
          expansionFactor = 2.5;
        } else if (group.length >= 3) {
          expansionFactor = 2.0;
        }
        
        expandedRadius = Math.round(report._originalRadius * expansionFactor);
      }
      
      // Trả về report với radius đã được mở rộng
      return {
        ...report,
        radius: expandedRadius
      };
    });
    
    // Loại bỏ các trường tạm thời
    const finalReports = expandedReports.map(report => {
      const { _lat, _lng, _originalRadius, ...cleanReport } = report;
      return cleanReport;
    });
    
    res.json({ reports: finalReports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;








