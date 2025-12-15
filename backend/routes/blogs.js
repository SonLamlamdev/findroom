const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const mongoose = require('mongoose');

// Get all blogs
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
    
    // 1. Build the Query
    const query = { published: true };

    if (category) query.category = category;
    if (tag) query.tags = { $in: [new RegExp(tag, 'i')] };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // 2. Handle Pagination Inputs
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    let blogs = [];
    let total = 0;

    // 3. SPECIAL CASE: Sort by 'likes' (Array Length)
    // MongoDB standard query cannot sort by array length easily, so we do it in memory.
    if (sort === 'likes' || sort === '-likes') {
      // Fetch all matching docs (projection to keep it light)
      const allMatchingDocs = await Blog.find(query)
        .select('likes createdAt views')
        .lean();
      
      total = allMatchingDocs.length;

      // Sort in Memory (High to Low)
      allMatchingDocs.sort((a, b) => {
        const lenA = a.likes ? a.likes.length : 0;
        const lenB = b.likes ? b.likes.length : 0;
        return lenB - lenA; // Descending
      });

      // Slice for Pagination
      const pagedIds = allMatchingDocs
        .slice(skip, skip + safeLimit)
        .map(doc => doc._id);

      // Fetch Full Details for the sliced IDs
      blogs = await Blog.find({ _id: { $in: pagedIds } })
        .populate('author', '_id name avatar')
        .lean();
      
      // Re-order to match the sorted IDs (because $in doesn't guarantee order)
      blogs.sort((a, b) => {
        return pagedIds.findIndex(id => id.equals(a._id)) - pagedIds.findIndex(id => id.equals(b._id));
      });

    } else {
      // 4. STANDARD CASE: Sort by Database Fields (createdAt, views)
      let sortOption = '-createdAt';
      if (sort === 'views' || sort === '-views') sortOption = '-views';
      else if (sort === 'oldest' || sort === 'createdAt') sortOption = 'createdAt';

      // Execute standard efficient query
      const [data, count] = await Promise.all([
        Blog.find(query)
          .populate('author', '_id name avatar')
          .sort(sortOption)
          .limit(safeLimit)
          .skip(skip)
          .lean(),
        Blog.countDocuments(query)
      ]);

      blogs = data;
      total = count;
    }

    // 5. SAFETY FILTER: Remove blogs where author is null (User deleted)
    // This prevents the "TypeError: null is not an object" on frontend
    blogs = blogs.filter(blog => blog.author !== null);

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
    console.error("Get Blogs Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Get single blog
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const blog = await Blog.findById(req.params.id)
      .populate('author', '_id name avatar')
      .populate('comments.user', '_id name avatar')
      .lean();
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Safely increment views
    Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

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
    
    // Upload files to Cloudinary
    let processedFiles = [];
    if (req.files && req.files.length > 0) {
      processedFiles = await require('../middleware/upload').uploadToCloudinary(req.files, 'findroom/blogs');
    }
    
    const { getFileUrls } = require('../utils/fileHelper');
    const images = getFileUrls(processedFiles);

    const blog = new Blog({
      ...blogData,
      author: req.userId,
      images
    });

    await blog.save();

    res.status(201).json({ message: 'Blog created', blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update blog
router.put('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    if (blog.author.toString() !== req.userId) return res.status(403).json({ error: 'Not authorized' });

    Object.assign(blog, req.body);
    await blog.save();
    res.json({ message: 'Blog updated', blog });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete blog
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    if (blog.author.toString() !== req.userId) return res.status(403).json({ error: 'Not authorized' });

    await blog.deleteOne();
    res.json({ message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Like/unlike blog
router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    const userIndex = blog.likes.indexOf(req.userId);
    if (userIndex > -1) blog.likes.splice(userIndex, 1);
    else blog.likes.push(req.userId);

    await blog.save();
    res.json({ message: 'Updated', likes: blog.likes.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    blog.comments.push({ user: req.userId, content: req.body.content });
    await blog.save();
    res.json({ message: 'Comment added', blog });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;