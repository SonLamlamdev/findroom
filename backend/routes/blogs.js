const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const mongoose = require('mongoose');

// Get all blogs (Refactored to use Aggregation for correct Sorting)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      tag,
      sort = '-createdAt', 
      page = 1, 
      limit = 10 
    } = req.query;

    const pipeline = [];

    // 1. MATCH: Filter published blogs
    const matchStage = { published: true };

    if (category) {
      matchStage.category = category;
    }

    if (tag) {
      matchStage.tags = { $in: [new RegExp(tag, 'i')] };
    }

    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    pipeline.push({ $match: matchStage });

    // 2. ADD FIELDS: Calculate 'likesCount' for sorting
    pipeline.push({
      $addFields: {
        likesCount: { $size: { $ifNull: ["$likes", []] } },
        commentsCount: { $size: { $ifNull: ["$comments", []] } }
      }
    });

    // 3. SORT: Handle various sort options
    let sortStage = {};
    if (sort === 'likes' || sort === '-likes') {
      sortStage = { likesCount: -1 };
    } else if (sort === 'views' || sort === '-views') {
      sortStage = { views: -1 };
    } else if (sort === 'oldest' || sort === 'createdAt') {
      sortStage = { createdAt: 1 };
    } else {
      // Default: Newest
      sortStage = { createdAt: -1 };
    }
    pipeline.push({ $sort: sortStage });

    // 4. PAGINATION: Skip and Limit
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    // Use $facet to get both data and count in one query
    pipeline.push({
      $facet: {
        blogs: [
          { $skip: skip },
          { $limit: safeLimit },
          // 5. LOOKUP: Manually populate Author (equivalent to .populate)
          {
            $lookup: {
              from: 'users', // Ensure this matches your collection name in DB (usually 'users')
              localField: 'author',
              foreignField: '_id',
              as: 'authorDetails'
            }
          },
          // 6. UNWIND: Lookup returns an array, we need the first object
          {
            $unwind: {
              path: '$authorDetails',
              preserveNullAndEmptyArrays: true // Vital: Keeps blog even if author is deleted
            }
          },
          // 7. PROJECT: Clean up the output to match your frontend interface
          {
            $project: {
              title: 1,
              content: 1,
              category: 1,
              tags: 1,
              images: 1,
              views: 1,
              likes: 1,
              comments: 1,
              createdAt: 1,
              likesCount: 1,
              author: {
                _id: '$authorDetails._id',
                name: '$authorDetails.name',
                avatar: '$authorDetails.avatar'
              }
            }
          }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    });

    const result = await Blog.aggregate(pipeline).maxTimeMS(2000);
    
    const blogs = result[0].blogs;
    const total = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;

    res.json({
      blogs,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit)
      }
    });

  } catch (error) {
    console.error("Blog fetch error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Get single blog
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const blog = await Blog.findById(req.params.id)
      .populate('author', '_id name avatar')
      .populate('comments.user', '_id name avatar')
      .lean()
      .maxTimeMS(1000);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Increment views (non-blocking)
    Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })
      .exec()
      .catch(err => console.error('View increment error:', err.message));

    res.json({ blog });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Create blog
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const blogData = req.body.data ? JSON.parse(req.body.data) : req.body;
    
    // Upload files to Cloudinary in parallel
    const upload = require('../middleware/upload');
    let processedFiles = [];
    if (req.files && req.files.length > 0) {
      processedFiles = await upload.uploadToCloudinary(req.files, 'findroom/blogs');
    }
    
    const { getFileUrls } = require('../utils/fileHelper');
    const images = getFileUrls(processedFiles);

    const blog = new Blog({
      ...blogData,
      author: req.userId,
      images
    });

    await blog.save();

    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Update blog
router.put('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(blog, req.body);
    await blog.save();

    res.json({ message: 'Blog updated successfully', blog });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete blog
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await blog.deleteOne();

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Like/unlike blog
router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const userIndex = blog.likes.indexOf(req.userId);
    
    if (userIndex > -1) {
      blog.likes.splice(userIndex, 1);
    } else {
      blog.likes.push(req.userId);
    }

    await blog.save();

    res.json({ message: 'Updated', likes: blog.likes.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    blog.comments.push({
      user: req.userId,
      content
    });

    await blog.save();

    res.json({ message: 'Comment added successfully', blog });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;