const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

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
const server = http.createServer(app);

// Socket.io CORS configuration - allow all Vercel preview deployments and dev tunnels
const socketIoOptions = {
  cors: {
    origin: function (origin, callback) {
      if (origin === "https://student-accommodation-frontend.onrender.com") {
        return callback(null, true);
      }
      // Allow requests without origin
      if (!origin) return callback(null, true); // allow server-to-server or Postman
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
      
      // Allow localhost
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      // Allow official CLIENT_URL
      if (origin === process.env.CLIENT_URL) {
        return callback(null, true);
      }
      
      // Allow dev tunnels in development mode
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment) {
        if (
          origin.includes('.devtunnels.ms') ||
          origin.includes('.ngrok.io') ||
          origin.includes('.ngrok-free.app') ||
          origin.includes('.loca.lt') ||
          origin.includes('.tunnel.dev')
        ) {
          return callback(null, true);
        }
      }
      
      // Allow all Vercel preview deployments
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: false
  }
};

const io = socketIo(server, socketIoOptions);

// CORS configuration
// Backend URL: https://findroom-qd83.onrender.com
// Frontend URL: https://findroom2-sonlamlamdevs-projects.vercel.app
// This configuration allows:
// 1. Requests without origin (Postman, Server-to-Server)
// 2. Localhost (development)
// 3. Official frontend URL from CLIENT_URL environment variable
// 4. All Vercel preview deployments (*.vercel.app)
// --- BẮT ĐẦU ĐOẠN CODE THAY THẾ ---

// Danh sách các domain cụ thể được phép truy cập
const allowedOrigins = [
  "http://localhost:5173",             // <--- Đã thêm Vite Localhost vào đây
  "http://localhost:3000",             // Thêm dự phòng
  process.env.CLIENT_URL,           // Link chính thức trên Vercel
  "https://student-accommodation-frontend.onrender.com",
  "https://student-accommodation-backend.onrender.com" // optional
];

const corsOptions = {
  origin: function (origin, callback) {
    // 1. Cho phép request từ Postman hoặc Server-to-Server (không có origin)
    if (!origin) return callback(null, true);

    // 2. Kiểm tra xem origin có nằm trong danh sách cụ thể ở trên không
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // 3. Kiểm tra Localhost (development) - Cho phép mọi port localhost
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // 4. Kiểm tra Dev Tunnels (chỉ cho phép khi chạy local/development)
    // Cho phép VS Code Dev Tunnels, ngrok, và các dev tunnel services khác
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
      // Cho phép các dev tunnel services phổ biến
      if (
        origin.includes('.devtunnels.ms') ||  // VS Code Dev Tunnels
        origin.includes('.ngrok.io') ||        // ngrok
        origin.includes('.ngrok-free.app') ||   // ngrok free
        origin.includes('.loca.lt') ||          // localtunnel
        origin.includes('.tunnel.dev')          // cloudflare tunnel
      ) {
        console.log('✅ Allowed dev tunnel:', origin);
        return callback(null, true);
      }
    }
    
    // 5. Kiểm tra các link Preview của Vercel (Quan trọng!)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    // Nếu không khớp cái nào thì chặn và Log ra để debug
    console.log('⚠️  CORS blocked origin:', origin);
    console.log('💡 Allowed: localhost, CLIENT_URL, *.vercel.app' + (isDevelopment ? ', dev tunnels' : ''));
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

// --- KẾT THÚC ĐOẠN CODE THAY THẾ ---

// Log CORS configuration on startup
const isDevelopment = process.env.NODE_ENV !== 'production';
console.log('🌐 CORS Configuration:');
console.log('  - Environment:', isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION');
console.log('  - Backend URL: https://findroom-qd83.onrender.com');
console.log('  - CLIENT_URL:', process.env.CLIENT_URL || 'Not set');
console.log('  - Allowed: localhost, CLIENT_URL, *.vercel.app' + (isDevelopment ? ', dev tunnels (*.devtunnels.ms, *.ngrok.io, etc.)' : ''));

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'https://student-accommodation-frontend.onrender.com', // your frontend URL
  credentials: true, // if using cookies/auth
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin'); // optional if needed
  }
}));
app.get('/api/saved', userRoutes);        // redirect to /users/saved-listings
app.get('/api/stayed', userRoutes);       // redirect to /users/stayed-listings

// PROXY FIX
// Rate limiting
app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);


//PROXY FIX
app.use(express.json());

// Socket.io for real-time notifications
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
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

// Health check
app.get('/api/health', (req, res) => {
  try {
    res.json({ status: 'OK', message: 'Server is running' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-accommodation';

if (!process.env.MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI not found in .env file. Using default: mongodb://localhost:27017/student-accommodation');
  console.warn('⚠️  Please create a .env file in the backend directory with MONGODB_URI');
}

mongoose.connect(MONGODB_URI)
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


