const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Calculate compatibility score
function calculateCompatibility(user1, user2) {
  let score = 0;
  const profile1 = user1.roommateProfile;
  const profile2 = user2.roommateProfile;

  if (!profile1 || !profile2) return 0;

  // University match (30 points)
  if (profile1.university === profile2.university) {
    score += 30;
  }

  // Budget compatibility (25 points)
  if (profile1.budget && profile2.budget) {
    const budget1Avg = (profile1.budget.min + profile1.budget.max) / 2;
    const budget2Avg = (profile2.budget.min + profile2.budget.max) / 2;
    const budgetDiff = Math.abs(budget1Avg - budget2Avg);
    
    if (budgetDiff < 500000) score += 25;
    else if (budgetDiff < 1000000) score += 15;
    else if (budgetDiff < 2000000) score += 5;
  }

  // Habits compatibility (25 points)
  if (profile1.habits && profile2.habits) {
    if (profile1.habits.sleepSchedule === profile2.habits.sleepSchedule) score += 8;
    
    const cleanlinessDiff = Math.abs(profile1.habits.cleanliness - profile2.habits.cleanliness);
    if (cleanlinessDiff <= 1) score += 8;
    
    if (profile1.habits.noise === profile2.habits.noise) score += 5;
    if (profile1.habits.smoking === profile2.habits.smoking) score += 2;
    if (profile1.habits.cooking === profile2.habits.cooking) score += 2;
  }

  // Shared interests (20 points)
  if (profile1.interests && profile2.interests) {
    const sharedInterests = profile1.interests.filter(interest => 
      profile2.interests.includes(interest)
    );
    score += Math.min(sharedInterests.length * 4, 20);
  }

  return Math.min(score, 100);
}

// Find compatible roommates
router.get('/find', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId)
      .select('roommateProfile')
      .lean()
      .maxTimeMS(500);
    
    if (!currentUser.roommateProfile || !currentUser.roommateProfile.lookingForRoommate) {
      return res.status(400).json({ 
        error: 'Please complete your roommate profile first and set lookingForRoommate to true' 
      });
    }

    // Find other users looking for roommates
    const potentialRoommates = await User.find({
      _id: { $ne: req.userId },
      'roommateProfile.lookingForRoommate': true
    })
      .select('name avatar roommateProfile')
      .limit(100)
      .lean()
      .maxTimeMS(1000);

    // Calculate compatibility scores
    const matches = potentialRoommates.map(user => ({
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        university: user.roommateProfile?.university,
        major: user.roommateProfile?.major,
        bio: user.roommateProfile?.bio,
        budget: user.roommateProfile?.budget,
        interests: user.roommateProfile?.interests
      },
      compatibilityScore: calculateCompatibility(currentUser, user),
      matchReasons: []
    }));

    // Sort by compatibility score
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Add match reasons for top matches
    matches.forEach(match => {
      if (match.user.university === currentUser.roommateProfile.university) {
        match.matchReasons.push('Same university');
      }
      
      const sharedInterests = currentUser.roommateProfile.interests?.filter(interest =>
        match.user.interests?.includes(interest)
      );
      
      if (sharedInterests && sharedInterests.length > 0) {
        match.matchReasons.push(`Shared interests: ${sharedInterests.slice(0, 3).join(', ')}`);
      }
      
      if (match.compatibilityScore >= 70) {
        match.matchReasons.push('High compatibility');
      }
    });

    res.json({ matches });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Get specific user's roommate profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name avatar roommateProfile')
      .lean()
      .maxTimeMS(500);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Save/unsave roommate
router.post('/save/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const roommateId = req.params.userId;
    
    if (user._id.toString() === roommateId) {
      return res.status(400).json({ error: 'Cannot save yourself' });
    }
    
    const index = user.savedRoommates.indexOf(roommateId);
    
    if (index > -1) {
      user.savedRoommates.splice(index, 1);
      await user.save();
      res.json({ message: 'Roommate removed from saved', saved: false });
    } else {
      user.savedRoommates.push(roommateId);
      await user.save();
      res.json({ message: 'Roommate saved', saved: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get saved roommates
router.get('/saved/list', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('savedRoommates')
      .lean()
      .maxTimeMS(500);
    
    if (!user || !user.savedRoommates || user.savedRoommates.length === 0) {
      return res.json({ roommates: [] });
    }

    const roommates = await User.find({
      _id: { $in: user.savedRoommates },
      'roommateProfile.lookingForRoommate': true
    })
      .select('name avatar roommateProfile')
      .lean()
      .maxTimeMS(1000);
    
    res.json({ roommates: roommates || [] });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

module.exports = router;








