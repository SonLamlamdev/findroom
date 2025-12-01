# Giải thích Kiến trúc và Cách Hoạt động của Hệ thống

## 📋 Tổng quan

Hệ thống này là một **ứng dụng web full-stack** để tìm trọ cho sinh viên, được xây dựng theo kiến trúc **Client-Server** với 3 thành phần chính:

```
┌─────────────┐      HTTP/WebSocket      ┌─────────────┐      Mongoose      ┌─────────────┐
│  Frontend   │ ◄─────────────────────► │   Backend   │ ◄────────────────► │  MongoDB    │
│  (React)    │   Port 5173              │  (Node.js)  │   Port 5000        │  Port 27017 │
│             │                          │             │                    │             │
│  - React    │                          │  - Express  │                    │  - Database │
│  - Vite     │                          │  - Socket.io│                    │  - NoSQL    │
│  - TypeScript│                         │  - Mongoose │                    │             │
└─────────────┘                          └─────────────┘                    └─────────────┘
```

---

## 🎯 1. FRONTEND (Client-side)

### Nền tảng chạy:
- **Môi trường:** Trình duyệt web (Chrome, Firefox, Edge, Safari)
- **Port:** 5173 (Vite dev server)
- **Framework:** React 18 + TypeScript
- **Build tool:** Vite

### Cách hoạt động:

#### 1.1. Khởi động ứng dụng (`main.tsx`)
```typescript
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
```
- React render component `App` vào thẻ `<div id="root">` trong `index.html`
- `ErrorBoundary` bắt lỗi để tránh crash toàn bộ app

#### 1.2. Routing (`App.tsx`)
```typescript
<Router>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/api/listings" element={<Listings />} />
  </Routes>
</Router>
```
- **React Router** quản lý điều hướng giữa các trang
- URL thay đổi → Component tương ứng được render
- **Không reload trang** (Single Page Application - SPA)

#### 1.3. State Management
- **AuthContext:** Quản lý trạng thái đăng nhập (user, token)
- **ThemeContext:** Quản lý theme (sáng/tối)
- **LocalStorage:** Lưu token và preferences

#### 1.4. Gửi request đến Backend

**Cách 1: Qua Vite Proxy (Development)**
```typescript
// Trong vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}

// Trong code
axios.get('/api/listings') 
// → Vite tự động chuyển đến http://localhost:5000/api/listings
```

**Cách 2: Qua Environment Variable (Production)**
```typescript
// frontend/.env
VITE_API_URL=http://localhost:5000

// Trong code
axios.get(`${import.meta.env.VITE_API_URL}/api/listings`)
```

---

## 🖥️ 2. BACKEND (Server-side)

### Nền tảng chạy:
- **Môi trường:** Node.js runtime
- **Port:** 5000
- **Framework:** Express.js
- **Database:** MongoDB (qua Mongoose)

### Cách hoạt động:

#### 2.1. Khởi động Server (`server.js`)

```javascript
// 1. Import các module
const express = require('express');
const mongoose = require('mongoose');

// 2. Tạo Express app
const app = express();

// 3. Kết nối MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    // 4. Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  });
```

**Flow khởi động:**
1. Load environment variables từ `.env`
2. Kết nối đến MongoDB
3. Khởi tạo Express app
4. Setup middleware (CORS, JSON parser, security)
5. Đăng ký routes
6. Lắng nghe trên port 5000

#### 2.2. Middleware (Xử lý request)

```javascript
// Security headers
app.use(helmet());

// Cho phép CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Parse JSON body
app.use(express.json());

// Rate limiting (giới hạn số request)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100 // tối đa 100 requests
});
app.use('/api/', limiter);
```

**Thứ tự xử lý request:**
```
Request → Helmet → CORS → JSON Parser → Rate Limiter → Routes → Response
```

#### 2.3. Routes (Định tuyến)

```javascript
// Đăng ký routes
app.use('/api/auth', authRoutes);      // /api/auth/login, /api/auth/register
app.use('/api/users', userRoutes);      // /api/users/profile
app.use('/api/listings', listingRoutes); // /api/listings, /api/listings/:id
app.use('/api/blogs', blogRoutes);     // /api/blogs
```

**Ví dụ: Route đăng nhập** (`routes/auth.js`)
```javascript
router.post('/login', [
  // Validation
  body('email').isEmail(),
  body('password').exists()
], async (req, res) => {
  // 1. Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // 2. Tìm user trong database
  const user = await User.findOne({ email: req.body.email });
  
  // 3. Kiểm tra password
  const isMatch = await user.comparePassword(req.body.password);
  
  // 4. Tạo JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  
  // 5. Trả về response
  res.json({ token, user });
});
```

**Flow xử lý request:**
```
1. Client gửi POST /api/auth/login
2. Express nhận request
3. Validation middleware kiểm tra input
4. Route handler:
   - Tìm user trong DB
   - So sánh password
   - Tạo JWT token
5. Trả về JSON response
```

#### 2.4. Authentication (Xác thực)

**JWT Token Flow:**
```
1. User đăng nhập → Backend tạo JWT token
2. Token được gửi về Frontend
3. Frontend lưu token vào localStorage
4. Mỗi request sau đó gửi kèm token:
   Authorization: Bearer <token>
5. Backend verify token → Cho phép/từ chối
```

**Middleware xác thực** (`middleware/auth.js`)
```javascript
const auth = async (req, res, next) => {
  // 1. Lấy token từ header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // 2. Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // 3. Tìm user
  const user = await User.findById(decoded.userId);
  
  // 4. Gắn user vào request
  req.user = user;
  next();
};
```

#### 2.5. Real-time Communication (Socket.io)

```javascript
// Khởi tạo Socket.io
const io = socketIo(server, {
  cors: { origin: 'http://localhost:5173' }
});

// Lắng nghe kết nối
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId); // User join room riêng
  });
});

// Gửi notification
io.to(userId).emit('notification', { message: 'Bạn có tin nhắn mới' });
```

**Use case:** Thông báo real-time khi có tin nhắn mới, đánh giá mới, v.v.

---

## 🗄️ 3. DATABASE (MongoDB)

### Nền tảng:
- **Loại:** NoSQL Document Database
- **Port:** 27017 (mặc định)
- **ODM:** Mongoose (Object Document Mapper)

### Cấu trúc Database:

#### 3.1. Connection String
```
mongodb://localhost:27017/student-accommodation
         └─host    └─port  └─database name
```

#### 3.2. Collections (Bảng dữ liệu)

**Collection: `users`**
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",
  password: "$2a$10$hashed...", // Bcrypt hash
  name: "Nguyễn Văn A",
  role: "tenant", // hoặc "landlord", "admin"
  savedListings: [ObjectId("..."), ...], // Reference đến listings
  roommateProfile: {
    university: "ĐH Bách Khoa",
    habits: { sleepSchedule: "late", ... }
  },
  createdAt: ISODate("2024-01-01"),
  updatedAt: ISODate("2024-01-01")
}
```

**Collection: `listings`**
```javascript
{
  _id: ObjectId("..."),
  landlord: ObjectId("..."), // Reference đến user
  title: "Phòng trọ gần ĐH Bách Khoa",
  price: 3000000,
  location: {
    address: "123 Đường ABC",
    coordinates: {
      type: "Point",
      coordinates: [106.6297, 10.8231] // [lng, lat]
    }
  },
  images: ["/uploads/image1.jpg", ...],
  status: "available",
  customId: "LIST-20240101-1234",
  createdAt: ISODate("2024-01-01")
}
```

**Collection: `blogs`**
```javascript
{
  _id: ObjectId("..."),
  author: ObjectId("..."), // Reference đến user
  title: "Mẹo tìm trọ",
  content: "...",
  likes: [ObjectId("..."), ...], // Array of user IDs
  comments: [
    {
      user: ObjectId("..."),
      content: "Bài viết hay!",
      createdAt: ISODate("...")
    }
  ],
  customId: "BLOG-20240101-5678"
}
```

#### 3.3. Relationships (Quan hệ)

**1. One-to-Many:**
- 1 User (landlord) → Nhiều Listings
- 1 User → Nhiều Blogs

**2. Many-to-Many:**
- Users ↔ Listings (savedListings)
- Users ↔ Blogs (likes)

**3. Embedded Documents:**
- Listing.location (nested object)
- User.roommateProfile (nested object)

#### 3.4. Mongoose Models

```javascript
// Định nghĩa Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['tenant', 'landlord', 'admin'] }
}, { timestamps: true });

// Tạo Model
const User = mongoose.model('User', userSchema);

// Sử dụng
const user = await User.findOne({ email: 'user@example.com' });
```

**Mongoose làm gì:**
- Validate dữ liệu trước khi lưu
- Tự động hash password (pre-save hook)
- Tạo timestamps (createdAt, updatedAt)
- Quản lý relationships (populate)

---

## 🔄 4. FLOW HOÀN CHỈNH CỦA MỘT REQUEST

### Ví dụ: User đăng nhập

```
┌─────────────┐
│   Browser   │
│  (Frontend) │
└──────┬──────┘
       │ 1. User nhập email/password
       │    Click "Đăng nhập"
       │
       ▼
┌─────────────────────────────────────┐
│  Login Component (React)            │
│  - handleSubmit()                   │
│  - axios.post('/api/auth/login')    │
└──────┬──────────────────────────────┘
       │ 2. Gửi HTTP POST request
       │    Body: { email, password }
       │
       ▼
┌─────────────────────────────────────┐
│  Vite Proxy (Port 5173)             │
│  - Nhận /api/auth/login             │
│  - Chuyển đến http://localhost:5000 │
└──────┬──────────────────────────────┘
       │ 3. Forward request
       │
       ▼
┌─────────────────────────────────────┐
│  Express Server (Port 5000)         │
│  - Middleware: CORS, JSON parser   │
│  - Route: /api/auth/login           │
└──────┬──────────────────────────────┘
       │ 4. Validation
       │    - Kiểm tra email format
       │    - Kiểm tra password tồn tại
       │
       ▼
┌─────────────────────────────────────┐
│  Route Handler (auth.js)            │
│  - User.findOne({ email })          │
│  - user.comparePassword()            │
└──────┬──────────────────────────────┘
       │ 5. Query Database
       │
       ▼
┌─────────────────────────────────────┐
│  MongoDB (Port 27017)               │
│  - Collection: users                 │
│  - Tìm user theo email               │
│  - So sánh password hash             │
└──────┬──────────────────────────────┘
       │ 6. Trả về user data
       │
       ▼
┌─────────────────────────────────────┐
│  Route Handler (tiếp)                │
│  - jwt.sign() tạo token              │
│  - res.json({ token, user })         │
└──────┬──────────────────────────────┘
       │ 7. HTTP Response
       │    Status: 200
       │    Body: { token, user }
       │
       ▼
┌─────────────────────────────────────┐
│  Frontend (AuthContext)              │
│  - Lưu token vào localStorage       │
│  - Lưu user vào state                │
│  - Redirect đến trang chủ           │
└─────────────────────────────────────┘
```

### Ví dụ: Lấy danh sách phòng trọ

```
1. User truy cập /listings
2. Listings component mount
3. useEffect() trigger
4. axios.get('/api/listings')
5. Vite proxy forward đến backend
6. Express route: GET /api/listings
7. Middleware auth (nếu cần)
8. Route handler:
   - Listing.find({ status: 'available' })
   - Populate landlord info
9. MongoDB query
10. Trả về JSON array
11. Frontend setState(listings)
12. Render danh sách phòng
```

---

## 🛠️ 5. CÔNG NGHỆ SỬ DỤNG

### Frontend:
- **React 18:** UI framework
- **TypeScript:** Type safety
- **Vite:** Build tool & dev server
- **React Router:** Client-side routing
- **Axios:** HTTP client
- **Tailwind CSS:** Styling
- **React Icons:** Icon library
- **Socket.io-client:** Real-time communication
- **i18next:** Đa ngôn ngữ

### Backend:
- **Node.js:** JavaScript runtime
- **Express.js:** Web framework
- **Mongoose:** MongoDB ODM
- **JWT:** Authentication
- **Bcrypt:** Password hashing
- **Socket.io:** WebSocket server
- **Multer:** File upload
- **Express Validator:** Input validation
- **Helmet:** Security headers
- **CORS:** Cross-origin support

### Database:
- **MongoDB:** NoSQL database
- **Mongoose:** ODM layer

---

## 📡 6. API ENDPOINTS

### Authentication:
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Listings:
- `GET /api/listings` - Lấy danh sách (có filter, search, pagination)
- `GET /api/listings/:id` - Chi tiết phòng
- `POST /api/listings` - Tạo mới (cần auth, landlord only)
- `PUT /api/listings/:id` - Cập nhật
- `DELETE /api/listings/:id` - Xóa

### Users:
- `GET /api/users/profile` - Profile
- `PUT /api/users/profile` - Cập nhật profile
- `POST /api/users/saved-listings/:id` - Lưu phòng
- `GET /api/users/saved-listings` - Danh sách đã lưu

### Blogs:
- `GET /api/blogs` - Danh sách blog
- `GET /api/blogs/:id` - Chi tiết blog
- `POST /api/blogs` - Tạo blog mới
- `POST /api/blogs/:id/like` - Like blog

### Maps:
- `GET /api/maps/listings` - Listings trên bản đồ
- `GET /api/maps/districts` - Tìm quận/huyện
- `POST /api/maps/annotations` - Tạo chú thích

---

## 🔐 7. BẢO MẬT

### Frontend:
- Token lưu trong localStorage
- Axios interceptor tự động thêm token vào header
- Protected routes kiểm tra authentication

### Backend:
- **JWT:** Token-based authentication
- **Bcrypt:** Password hashing (salt rounds: 10)
- **Helmet:** Security headers
- **Rate Limiting:** Chống DDoS
- **CORS:** Chỉ cho phép origin được cấu hình
- **Input Validation:** Express Validator

### Database:
- Password không lưu plain text
- Indexes cho performance
- Unique constraints

---

## 🚀 8. DEPLOYMENT

### Development:
- Frontend: `npm run dev` → http://localhost:5173
- Backend: `npm run dev` → http://localhost:5000
- MongoDB: Local instance

### Production:
- Frontend: Build → Static files → Nginx/CDN
- Backend: Node.js process → PM2/Docker
- Database: MongoDB Atlas (cloud) hoặc VPS

---

## 📊 9. DATA FLOW TỔNG QUAN

```
User Action
    ↓
React Component
    ↓
Axios Request
    ↓
Vite Proxy (dev) / Direct (prod)
    ↓
Express Server
    ↓
Middleware (Auth, Validation)
    ↓
Route Handler
    ↓
Mongoose Query
    ↓
MongoDB
    ↓
Response
    ↓
React State Update
    ↓
UI Re-render
```

---

## 💡 TÓM TẮT

1. **Frontend (React):** Chạy trên trình duyệt, gửi HTTP requests
2. **Backend (Node.js/Express):** Nhận requests, xử lý logic, query database
3. **Database (MongoDB):** Lưu trữ dữ liệu dạng documents
4. **Communication:** HTTP/HTTPS cho API, WebSocket cho real-time
5. **Authentication:** JWT tokens
6. **Security:** Password hashing, rate limiting, CORS

Hệ thống hoạt động theo mô hình **RESTful API** với **SPA (Single Page Application)** frontend.

