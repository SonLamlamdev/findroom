const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Check environment
const isDevelopment = process.env.NODE_ENV !== 'production';

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not found in .env file. Using default (NOT SECURE FOR PRODUCTION)');
  process.env.JWT_SECRET = 'default_jwt_secret_change_in_production_' + Date.now();
  console.warn('⚠️  Please create a .env file in the backend directory with JWT_SECRET');
}

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const listingRoutes = require('./routes/listings');
const reviewRoutes = require('./routes/reviews');
const roommateRoutes = require('./routes/roommates');
const blogRoutes = require('./routes/blogs');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');
const mapRoutes = require('./routes/maps');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

const socketIoOptions = {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      const productionFrontend = 'https://student-accommodation-frontend.onrender.com';
      const allowedOrigins = [productionFrontend];
      
      if (isDevelopment) {
        allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
      }
      
      if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
        allowedOrigins.push(process.env.CLIENT_URL);
      }
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
};

const io = socketIo(server, socketIoOptions);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const productionFrontend = 'https://student-accommodation-frontend.onrender.com';
    const allowedOrigins = isDevelopment 
      ? [productionFrontend, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000']
      : [productionFrontend];
    
    if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
      allowedOrigins.push(process.env.CLIENT_URL);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.warn('⚠️ CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

console.log('🌐 CORS Configuration:');
console.log('  - Environment:', isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION');
console.log('  - Allowed Origins:', isDevelopment ? 'localhost + https://student-accommodation-frontend.onrender.com' : 'https://student-accommodation-frontend.onrender.com');
if (process.env.CLIENT_URL) console.log('  - CLIENT_URL:', process.env.CLIENT_URL);

app.use(cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Rate limiting configuration
// More lenient in development, stricter in production
// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // More lenient in development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

// Auth routes rate limiter (more lenient for login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 50 : 10, // Allow more attempts in development
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

// Apply rate limiting
app.use('/api/auth', authLimiter); // Stricter for auth routes
app.use('/api/', generalLimiter); // General rate limiting for all other routes

io.on('connection', (socket) => {
  try {
    console.log('New client connected');
    
    socket.on('join', (userId) => {
      try {
        socket.join(userId);
      } catch (error) {
        console.error('❌ Socket join error:', error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
    
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error.message);
    });
  } catch (error) {
    console.error('❌ Socket connection error:', error.message);
  }
});

// Make io accessible to routes
app.set('io', io);

app.use('/api/health', (req, res) => {
  try {
    res.json({ status: 'OK', message: 'Server is running' });
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/roommates', roommateRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  
  console.error('❌ Unhandled Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: {
      message: status === 500 ? 'Internal Server Error' : err.message
    }
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-accommodation';

if (!process.env.MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI not found in .env file. Using default: mongodb://localhost:27017/student-accommodation');
  console.warn('⚠️  Please create a .env file in the backend directory with MONGODB_URI');
}

//mongoose.connect(MONGODB_URI)
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log(`📦 Database: ${MONGODB_URI}`);
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.error('\n💡 Troubleshooting tips:');
  console.error('   1. Make sure MongoDB is installed and running');
  console.error('   2. Check if MongoDB service is started (mongod)');
  console.error('   3. Verify MONGODB_URI in .env file is correct');
  console.error('   4. For Windows: Start MongoDB service from Services or run: net start MongoDB');
  console.error('   5. For Linux/Mac: Run: sudo systemctl start mongod or mongod');
  process.exit(1);
});


