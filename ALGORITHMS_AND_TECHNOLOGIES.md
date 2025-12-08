# 📚 Tổng hợp Thuật toán, Công cụ và Cách thức Hoạt động của Web

## 🔢 CÁC THUẬT TOÁN ĐÃ SỬ DỤNG

### 1. **Thuật toán Tính khoảng cách Địa lý (Haversine Formula)**
- **Vị trí**: `backend/routes/maps.js` - `calculateDistance()`
- **Mục đích**: Tính khoảng cách giữa 2 điểm trên bề mặt Trái Đất
- **Công thức**: 
  ```
  a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
  c = 2 × atan2(√a, √(1-a))
  distance = R × c (R = 6371000m - bán kính Trái Đất)
  ```
- **Ứng dụng**: 
  - Kiểm tra 2 vùng ngập lụt có giao nhau không
  - Tìm kiếm phòng trọ trong bán kính nhất định
  - Tính toán khoảng cách giữa các điểm trên bản đồ

### 2. **Thuật toán Phát hiện Giao nhau của Circle (Circle Intersection)**
- **Vị trí**: `backend/routes/maps.js` - `circlesIntersect()`
- **Mục đích**: Kiểm tra xem 2 vùng tròn (flood reports) có giao nhau không
- **Logic**: 
  ```
  distance < (radius1 + radius2) → Giao nhau
  ```
- **Ứng dụng**: Phát hiện các báo cáo ngập lụt gần nhau để mở rộng vùng ngập

### 3. **Thuật toán Nhóm Clustering (Union-Find / Connected Components)**
- **Vị trí**: `backend/routes/maps.js` - Route `/flood-reports-clustered`
- **Mục đích**: Nhóm các flood reports giao nhau lại với nhau
- **Thuật toán**:
  1. Duyệt từng report chưa được xử lý
  2. Tìm tất cả reports giao nhau với report hiện tại (transitive closure)
  3. Nhóm tất cả reports giao nhau vào một nhóm
  4. Lặp lại cho đến khi không còn report mới nào được thêm vào nhóm
- **Ứng dụng**: Tạo các vùng ngập lụt lớn từ nhiều báo cáo giao nhau

### 4. **Thuật toán Mở rộng Radius (Radius Expansion)**
- **Vị trí**: `backend/routes/maps.js` - Route `/flood-reports-clustered`
- **Mục đích**: Mở rộng bán kính của các flood reports khi có >= 2 reports giao nhau
- **Logic**:
  - 2 reports: mở rộng 1.5x
  - 3-4 reports: mở rộng 2.0x
  - >= 5 reports: mở rộng 2.5x
- **Ứng dụng**: Tạo vùng ngập lụt lớn hơn khi có nhiều báo cáo gần nhau

### 5. **Thuật toán Tính Độ tương thích (Compatibility Scoring)**
- **Vị trí**: `backend/routes/roommates.js` - `calculateCompatibility()`
- **Mục đích**: Tính điểm tương thích giữa 2 người dùng tìm bạn cùng phòng
- **Công thức**:
  ```
  Tổng điểm tối đa: 100 điểm
  - Trùng trường đại học: 30 điểm
  - Tương thích ngân sách: 25 điểm
    + Chênh lệch < 500k: 25 điểm
    + Chênh lệch < 1tr: 15 điểm
    + Chênh lệch < 2tr: 5 điểm
  - Tương thích thói quen: 25 điểm
    + Lịch ngủ giống: 8 điểm
    + Độ sạch sẽ (chênh lệch ≤ 1): 8 điểm
    + Mức độ ồn giống: 5 điểm
    + Hút thuốc giống: 2 điểm
    + Nấu ăn giống: 2 điểm
  - Sở thích chung: 20 điểm
    + Mỗi sở thích chung: 4 điểm (tối đa 20)
  ```
- **Ứng dụng**: Sắp xếp danh sách bạn cùng phòng theo độ tương thích

### 6. **Thuật toán Sắp xếp (Sorting Algorithms)**
- **Vị trí**: Nhiều routes (listings, blogs, roommates)
- **Các loại sắp xếp**:
  - **Theo giá**: `price`, `-price` (tăng dần/giảm dần)
  - **Theo thời gian**: `-createdAt`, `createdAt` (mới nhất/cũ nhất)
  - **Theo đánh giá**: `-rating.average` (cao nhất)
  - **Theo lượt xem**: `-views` (nhiều nhất)
  - **Theo độ tương thích**: `compatibilityScore` (cao nhất)
- **Implementation**: Sử dụng MongoDB sort hoặc JavaScript `.sort()`

### 7. **Thuật toán Tính Rating (Rating Calculation)**
- **Vị trí**: 
  - `backend/routes/reviews.js` - Tính rating trung bình cho listings
  - `backend/routes/blogs.js` - Tính rating cho blogs
- **Công thức**:
  - **Listings**: `average = tổng tất cả ratings / số lượng reviews`
  - **Blogs**: `rating = (likes / (views + 1)) * 5`
- **Ứng dụng**: Hiển thị đánh giá trung bình cho phòng trọ và bài viết

### 8. **Thuật toán Trust Score (Hệ thống Độ tin cậy)**
- **Vị trí**: `backend/models/User.js`, `backend/models/FloodReport.js`
- **Mục đích**: Đánh giá độ tin cậy của người dùng khi báo cáo ngập lụt
- **Logic**:
  - Mỗi user có `floodReportTrustScore` (1-5)
  - Khi tạo flood report, `totalTrustScore = userTrustScore`
  - Khi report được xác nhận, trust score của user tăng
  - Flood zones chỉ hiển thị khi `totalTrustScore >= 10` hoặc `count >= 3`
- **Ứng dụng**: Lọc và ưu tiên các báo cáo ngập lụt đáng tin cậy

### 9. **Thuật toán H3 Hexagon Grid (Geospatial Indexing)**
- **Vị trí**: `backend/routes/maps.js` - Route `/flood-zones`
- **Thư viện**: `h3-js` (Uber's H3 library)
- **Mục đích**: Nhóm các flood reports theo lục giác để tạo vùng ngập lụt
- **Resolution**: 10 (~50m hexagon)
- **Logic**:
  1. Chuyển đổi tọa độ lat/lng sang H3 index
  2. Nhóm tất cả reports có cùng H3 index
  3. Tính tổng trust score và xác định mức độ ngập cao nhất
  4. Chỉ hiển thị hexagon có >= 3 reports hoặc totalTrustScore >= 10
  5. Chuyển đổi H3 index sang polygon để hiển thị trên bản đồ
- **Ứng dụng**: Tạo vùng ngập lụt dạng lục giác trên bản đồ

### 10. **Thuật toán Tìm kiếm Full-text (Regex Search)**
- **Vị trí**: `backend/routes/listings.js`, `backend/routes/blogs.js`
- **Mục đích**: Tìm kiếm phòng trọ và bài viết theo từ khóa
- **Implementation**: MongoDB `$regex` với option `'i'` (case-insensitive)
- **Tìm kiếm trong**:
  - Listings: `title`, `description`, `location.address`, `location.district`
  - Blogs: `title`, `content`, `tags`
- **Ứng dụng**: Tìm kiếm nhanh theo từ khóa

### 11. **Thuật toán Băm Mật khẩu (Password Hashing)**
- **Vị trí**: `backend/models/User.js`
- **Thư viện**: `bcryptjs`
- **Mục đích**: Bảo mật mật khẩu người dùng
- **Implementation**:
  - Sử dụng `bcrypt.genSalt(10)` để tạo salt
  - Hash password với `bcrypt.hash()`
  - So sánh password với `bcrypt.compare()`
- **Ứng dụng**: Bảo mật thông tin đăng nhập

### 12. **Thuật toán JWT (JSON Web Token)**
- **Vị trí**: `backend/routes/auth.js`, `backend/middleware/auth.js`
- **Thư viện**: `jsonwebtoken`
- **Mục đích**: Xác thực người dùng không cần session
- **Implementation**:
  - Tạo token: `jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })`
  - Xác thực token: `jwt.verify(token, JWT_SECRET)`
- **Ứng dụng**: Authentication và Authorization

---

## 🛠️ CÁC CÔNG CỤ VÀ THƯ VIỆN

### **Backend Technologies**

#### **Core Framework & Runtime**
- **Node.js**: Runtime environment cho JavaScript
- **Express.js** (v4.18.2): Web framework cho Node.js
- **MongoDB** với **Mongoose** (v8.0.0): Database NoSQL và ODM

#### **Authentication & Security**
- **bcryptjs** (v2.4.3): Băm mật khẩu
- **jsonwebtoken** (v9.0.2): JWT authentication
- **helmet** (v7.1.0): Bảo mật HTTP headers
- **express-rate-limit** (v7.1.5): Giới hạn số lượng request
- **express-validator** (v7.0.1): Validation dữ liệu đầu vào

#### **File Upload**
- **multer** (v1.4.5-lts.1): Upload file (hình ảnh)

#### **Real-time Communication**
- **socket.io** (v4.6.0): WebSocket cho real-time notifications

#### **Geospatial & Mapping**
- **h3-js** (v4.1.0): Thư viện H3 của Uber để tạo hexagon grid

#### **Utilities**
- **cors** (v2.8.5): Cross-Origin Resource Sharing
- **dotenv** (v16.3.1): Quản lý biến môi trường

### **Frontend Technologies**

#### **Core Framework**
- **React** (v18.2.0): UI library
- **TypeScript** (v5.2.2): Type-safe JavaScript
- **Vite** (v5.0.8): Build tool và dev server

#### **Routing**
- **react-router-dom** (v6.20.0): Client-side routing

#### **HTTP Client**
- **axios** (v1.6.2): HTTP client cho API calls

#### **Maps & Geospatial**
- **leaflet** (v1.9.4): Open-source map library
- **react-leaflet** (v4.2.1): React wrapper cho Leaflet
- **h3-js** (v4.1.0): H3 hexagon grid (frontend)

#### **UI & Styling**
- **tailwindcss** (v3.3.6): Utility-first CSS framework
- **react-icons** (v4.12.0): Icon library
- **react-hot-toast** (v2.4.1): Toast notifications

#### **Internationalization**
- **i18next** (v23.7.6): Internationalization framework
- **react-i18next** (v13.5.0): React bindings cho i18next

#### **Real-time**
- **socket.io-client** (v4.6.0): Client cho Socket.io

#### **Utilities**
- **date-fns** (v2.30.0): Date manipulation
- **recharts** (v2.10.3): Chart library

---

## 🌐 CÁCH THỨC HOẠT ĐỘNG CỦA WEB

### **1. Kiến trúc Tổng quan**

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Vite
│   (Port 5173)   │  └─> UI Components
└────────┬────────┘  └─> State Management (Context API)
         │
         │ HTTP/HTTPS
         │ REST API
         │
┌────────▼────────┐
│   Backend       │  Node.js + Express
│   (Port 5000)   │  └─> REST API Routes
└────────┬────────┘  └─> Middleware (Auth, Upload, etc.)
         │
         │ Mongoose ODM
         │
┌────────▼────────┐
│   MongoDB       │  NoSQL Database
│   (Cloud/       │  └─> Collections: Users, Listings, Reviews, etc.
│    Local)       │
└─────────────────┘
```

### **2. Luồng Xác thực (Authentication Flow)**

```
1. User đăng ký/đăng nhập
   ↓
2. Backend kiểm tra thông tin
   ↓
3. Hash password với bcrypt
   ↓
4. Tạo JWT token (expires in 7 days)
   ↓
5. Trả về token cho frontend
   ↓
6. Frontend lưu token vào localStorage
   ↓
7. Mỗi request gửi kèm token trong header: Authorization: Bearer <token>
   ↓
8. Middleware auth.js verify token
   ↓
9. Nếu hợp lệ → tiếp tục, nếu không → 401 Unauthorized
```

### **3. Luồng Tìm kiếm Phòng trọ**

```
1. User nhập từ khóa/tìm kiếm
   ↓
2. Frontend gửi GET request: /api/listings?search=...&minPrice=...&maxPrice=...
   ↓
3. Backend xử lý query:
   - Tạo MongoDB query với $regex cho search
   - Filter theo price range ($gte, $lte)
   - Filter theo roomType, district, city
   - Filter theo amenities ($all)
   ↓
4. MongoDB thực hiện query và trả về kết quả
   ↓
5. Backend sort kết quả (price, rating, views, createdAt)
   ↓
6. Trả về JSON response
   ↓
7. Frontend hiển thị danh sách phòng trọ
```

### **4. Luồng Báo cáo Ngập lụt**

```
1. User click "Báo ngập lụt" trên bản đồ
   ↓
2. Frontend lấy vị trí hiện tại (Geolocation API)
   ↓
3. User điền form (level, depth, description, image)
   ↓
4. Frontend gửi POST request: /api/maps/flood-reports
   - FormData với image
   ↓
5. Backend xử lý:
   - Upload image với multer
   - Chuyển đổi tọa độ sang GeoJSON format
   - Tính H3 index (hexagon grid)
   - Lấy user trust score
   - Tạo FloodReport document
   ↓
6. Lưu vào MongoDB
   ↓
7. Trả về response
   ↓
8. Frontend refresh bản đồ để hiển thị report mới
```

### **5. Luồng Clustering Flood Reports**

```
1. Frontend gửi GET request: /api/maps/flood-reports-clustered
   ↓
2. Backend lấy tất cả active reports (chưa hết hạn)
   ↓
3. Chuyển đổi tọa độ từ GeoJSON sang {lat, lng}
   ↓
4. Nhóm các reports giao nhau:
   - Duyệt từng report
   - Tìm tất cả reports giao nhau (circlesIntersect)
   - Nhóm lại (transitive closure)
   ↓
5. Mở rộng radius cho các nhóm có >= 2 reports:
   - 2 reports: 1.5x
   - 3-4 reports: 2.0x
   - >=5 reports: 2.5x
   ↓
6. Trả về reports với radius đã mở rộng
   ↓
7. Frontend hiển thị Circle trên bản đồ với radius mới
```

### **6. Luồng Tìm bạn cùng phòng**

```
1. User hoàn thành roommate profile
   ↓
2. User click "Tìm bạn cùng phòng"
   ↓
3. Frontend gửi GET request: /api/roommates/find
   ↓
4. Backend:
   - Lấy danh sách users có lookingForRoommate = true
   - Với mỗi user, tính compatibility score:
     * University match: 30 điểm
     * Budget compatibility: 25 điểm
     * Habits compatibility: 25 điểm
     * Shared interests: 20 điểm
   - Sort theo compatibility score (cao nhất trước)
   - Thêm match reasons
   ↓
5. Trả về danh sách matches
   ↓
6. Frontend hiển thị với compatibility score và match reasons
```

### **7. Luồng Real-time Notifications**

```
1. Backend sử dụng Socket.io
   ↓
2. Khi có event (ví dụ: có review mới cho listing)
   ↓
3. Backend emit event: io.to(userId).emit('notification', data)
   ↓
4. Frontend (socket.io-client) nhận event
   ↓
5. Hiển thị toast notification
   ↓
6. Cập nhật notification badge
```

### **8. Luồng Upload Hình ảnh**

```
1. User chọn file image
   ↓
2. Frontend tạo FormData và append file
   ↓
3. Gửi POST request với Content-Type: multipart/form-data
   ↓
4. Backend middleware multer xử lý:
   - Lưu file vào thư mục uploads/
   - Trả về đường dẫn file
   ↓
5. Lưu đường dẫn vào database
   ↓
6. Frontend hiển thị image từ URL
```

### **9. Luồng Geospatial Queries**

```
1. User di chuyển/zoom bản đồ
   ↓
2. Frontend tính bounds (tọa độ góc)
   ↓
3. Gửi GET request: /api/maps/listings?bounds=swLng,swLat,neLng,neLat
   ↓
4. Backend tạo MongoDB geospatial query:
   {
     'location.coordinates': {
       $geoWithin: {
         $box: [[swLng, swLat], [neLng, neLat]]
       }
     }
   }
   ↓
5. MongoDB sử dụng 2dsphere index để tìm nhanh
   ↓
6. Trả về listings trong bounds
   ↓
7. Frontend hiển thị markers trên bản đồ
```

### **10. Luồng H3 Hexagon Grid**

```
1. Khi tạo flood report:
   - Backend tính H3 index: h3.latLngToCell(lat, lng, 10)
   - Lưu h3Index vào report
   ↓
2. Khi lấy flood zones:
   - Backend lấy tất cả reports
   - Nhóm theo h3Index (Map data structure)
   - Tính tổng trust score và max level
   - Filter: chỉ lấy hexagon có >= 3 reports hoặc totalTrustScore >= 10
   ↓
3. Chuyển đổi H3 index sang polygon:
   - h3.cellToBoundary(h3Index) → boundary coordinates
   - Chuyển đổi sang [lng, lat] format
   ↓
4. Trả về zones với polygon
   ↓
5. Frontend hiển thị Polygon trên bản đồ
```

---

## 📊 Cấu trúc Database

### **Collections chính:**

1. **Users**: Thông tin người dùng, roommate profile, trust score
2. **Listings**: Phòng trọ, tọa độ, giá, tiện nghi
3. **Reviews**: Đánh giá phòng trọ, rating
4. **Blogs**: Bài viết blog, tags, likes, views
5. **FloodReports**: Báo cáo ngập lụt, tọa độ, H3 index, trust score
6. **MapAnnotations**: Chú thích trên bản đồ (giá, ngập lụt, an ninh)
7. **Messages**: Tin nhắn giữa users
8. **Notifications**: Thông báo

### **Indexes:**

- **Geospatial**: `location.coordinates: '2dsphere'` (cho listings, flood reports, annotations)
- **Text search**: Index trên các trường thường tìm kiếm
- **Performance**: Index trên status, createdAt, rating, etc.

---

## 🔒 Bảo mật

1. **Password Hashing**: bcrypt với salt rounds = 10
2. **JWT Authentication**: Token expires sau 7 ngày
3. **Rate Limiting**: Giới hạn số request (100 requests/15 phút)
4. **CORS**: Chỉ cho phép các origin được phép
5. **Helmet**: Bảo vệ HTTP headers
6. **Input Validation**: express-validator cho tất cả input
7. **File Upload**: Giới hạn kích thước và kiểu file

---

## 🚀 Deployment

- **Backend**: Render.com (Node.js)
- **Frontend**: Vercel (React)
- **Database**: MongoDB Atlas (Cloud) hoặc Local MongoDB
- **File Storage**: Local storage (uploads/) hoặc có thể dùng cloud storage

---

## 📈 Performance Optimizations

1. **Database Indexing**: Geospatial indexes cho queries nhanh
2. **Pagination**: Limit số lượng kết quả trả về
3. **Caching**: Có thể thêm Redis cho caching
4. **Lazy Loading**: Load dữ liệu khi cần (bounds-based queries)
5. **Image Optimization**: Có thể thêm image compression

---

*Tài liệu này được tạo tự động dựa trên phân tích codebase*

