const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      tag,
      sort = '-createdAt', // -createdAt, -likes, -views, -rating
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = { published: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [new RegExp(tag, 'i')] };
    }

    // Search by keyword
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    let sortOption = '-createdAt';
    if (sort === 'likes') sortOption = '-likes';
    else if (sort === 'views') sortOption = '-views';
    else if (sort === 'rating') sortOption = '-rating';
    else if (sort === 'newest') sortOption = '-createdAt';
    else if (sort === 'oldest') sortOption = 'createdAt';

    const blogs = await Blog.find(query)
      .populate('author', 'name avatar')
      .sort(sortOption)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // Calculate rating for each blog (based on likes/views ratio)
    const blogsWithRating = blogs.map(blog => {
      const blogObj = blog.toObject();
      // Simple rating: likes / (views + 1) * 5
      blogObj.rating = blog.views > 0 
        ? (blog.likes.length / (blog.views + 1)) * 5 
        : 0;
      return blogObj;
    });

    // Re-sort if sort by rating
    if (sort === 'rating') {
      blogsWithRating.sort((a, b) => b.rating - a.rating);
    }

    const total = await Blog.countDocuments(query);

    res.json({
      blogs: sort === 'rating' ? blogsWithRating : blogs,
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

// Get single blog
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('comments.user', 'name avatar');
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json({ blog });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create blog
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const blogData = req.body.data ? JSON.parse(req.body.data) : req.body;
    
    const { getFileUrls } = require('../utils/fileHelper');
    const images = getFileUrls(req.files || []);

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
    res.status(500).json({ error: 'Server error' });
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

// Add comment
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








