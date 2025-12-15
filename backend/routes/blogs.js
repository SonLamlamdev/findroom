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
    if (sort === 'likes' || sort === '-likes') {
      const allMatchingDocs = await Blog.find(query)
        .select('likes createdAt views')
        .lean();
      
      total = allMatchingDocs.length;

      // Sort in Memory (High to Low)
      allMatchingDocs.sort((a, b) => {
        const lenA = a.likes ? a.likes.length : 0;
        const lenB = b.likes ? b.likes.length : 0;
        return lenB - lenA; 
      });

      // Slice for Pagination
      const pagedIds = allMatchingDocs
        .slice(skip, skip + safeLimit)
        .map(doc => doc._id);

      // Fetch Full Details
      blogs = await Blog.find({ _id: { $in: pagedIds } })
        .populate('author', '_id name avatar')
        .lean();
      
      // Re-order to match the sorted IDs
      blogs.sort((a, b) => {
        return pagedIds.findIndex(id => id.equals(a._id)) - pagedIds.findIndex(id => id.equals(b._id));
      });

    } else {
      // 4. STANDARD CASE: Sort by DB Fields
      let sortOption = '-createdAt';
      if (sort === 'views' || sort === '-views') sortOption = '-views';
      else if (sort === 'oldest' || sort === 'createdAt') sortOption = 'createdAt';

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

    // 5. SAFETY HANDLING: Map null authors instead of filtering
    // This fixes the issue where results disappear if the user was deleted
    blogs = blogs.map(blog => {
      if (!blog.author) {
        return {
          ...blog,
          author: { 
            _id: null, 
            name: 'Người dùng ẩn', // Or "Unknown User"
            avatar: null 
          }
        };
      }
      return blog;
    });

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

// ... Keep all other routes (get/:id, post, put, delete, etc.) exactly the same as before ...
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
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();
    res.json({ blog });
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const blogData = req.body.data ? JSON.parse(req.body.data) : req.body;
    let processedFiles = [];
    if (req.files && req.files.length > 0) {
      processedFiles = await require('../middleware/upload').uploadToCloudinary(req.files, 'findroom/blogs');
    }
    const images = require('../utils/fileHelper').getFileUrls(processedFiles);
    const blog = new Blog({ ...blogData, author: req.userId, images });
    await blog.save();
    res.status(201).json({ message: 'Blog created', blog });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    if (blog.author.toString() !== req.userId) return res.status(403).json({ error: 'Not authorized' });
    Object.assign(blog, req.body);
    await blog.save();
    res.json({ message: 'Blog updated', blog });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    if (blog.author.toString() !== req.userId) return res.status(403).json({ error: 'Not authorized' });
    await blog.deleteOne();
    res.json({ message: 'Blog deleted' });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    const userIndex = blog.likes.indexOf(req.userId);
    if (userIndex > -1) blog.likes.splice(userIndex, 1);
    else blog.likes.push(req.userId);
    await blog.save();
    res.json({ message: 'Updated', likes: blog.likes.length });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    blog.comments.push({ user: req.userId, content: req.body.content });
    await blog.save();
    res.json({ message: 'Comment added', blog });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;