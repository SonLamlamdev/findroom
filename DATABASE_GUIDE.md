# Hướng dẫn Kết nối và Quản lý Database

## 1. Cách Code Kết nối với Database

### 1.1. Công nghệ sử dụng

Code này sử dụng:
- **MongoDB**: Database NoSQL
- **Mongoose**: ODM (Object Document Mapper) cho Node.js
- **Connection String**: Thông qua biến môi trường `MONGODB_URI`

### 1.2. Cách kết nối (trong `backend/server.js`)

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

// Lấy connection string từ file .env
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-accommodation';

// Kết nối với MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
});
```

### 1.3. Cấu hình Connection String

**Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/student-accommodation
```

**MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/student-accommodation?retryWrites=true&w=majority
```

### 1.4. Các Models (Collections) trong Database

Code có các models sau (tương ứng với collections trong MongoDB):

1. **User** (`users` collection)
   - Thông tin người dùng (chủ trọ, người thuê, admin)
   - File: `backend/models/User.js`

2. **Listing** (`listings` collection)
   - Thông tin phòng trọ đã đăng
   - File: `backend/models/Listing.js`

3. **Review** (`reviews` collection)
   - Đánh giá từ người thuê
   - File: `backend/models/Review.js`

4. **Blog** (`blogs` collection)
   - Bài viết blog
   - File: `backend/models/Blog.js`

5. **Notification** (`notifications` collection)
   - Thông báo cho người dùng
   - File: `backend/models/Notification.js`

6. **MapData** (`mapdatas` collection)
   - Dữ liệu bản đồ (giá, an ninh, ngập lụt...)
   - File: `backend/models/MapData.js`

---

## 2. Các Công cụ Quản lý Database

### 2.1. MongoDB Compass (GUI - Khuyến nghị nhất)

**Tải về:**
- Windows/Mac/Linux: [mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)
- Hoàn toàn miễn phí

**Cách sử dụng:**

1. **Cài đặt và mở MongoDB Compass**

2. **Kết nối với Local MongoDB:**
   - Connection String: `mongodb://localhost:27017`
   - Click "Connect"

3. **Kết nối với MongoDB Atlas:**
   - Vào MongoDB Atlas → Database → Connect → Compass
   - Copy connection string
   - Paste vào Compass → Connect

4. **Xem dữ liệu:**
   - Chọn database: `student-accommodation`
   - Xem các collections: `users`, `listings`, `reviews`, etc.
   - Click vào collection để xem documents

5. **Thao tác dữ liệu:**
   - **Xem**: Click vào document
   - **Thêm**: Click "INSERT DOCUMENT"
   - **Sửa**: Click vào document → Click "Update"
   - **Xóa**: Click vào document → Click "Delete"

**Ưu điểm:**
- ✅ Giao diện trực quan, dễ sử dụng
- ✅ Xem dữ liệu dạng JSON tree
- ✅ Tìm kiếm, filter dễ dàng
- ✅ Import/Export dữ liệu
- ✅ Xem indexes, performance

### 2.2. MongoDB Atlas Web UI (Cho Cloud Database)

**Truy cập:**
- [cloud.mongodb.com](https://cloud.mongodb.com)
- Đăng nhập vào tài khoản Atlas

**Cách sử dụng:**

1. **Xem Collections:**
   - Vào "Database" → Click "Browse Collections"
   - Chọn cluster → Chọn database → Xem collections

2. **Thao tác dữ liệu:**
   - Click vào collection để xem documents
   - Click "INSERT DOCUMENT" để thêm
   - Click vào document để sửa/xóa

**Ưu điểm:**
- ✅ Không cần cài đặt
- ✅ Quản lý trực tiếp trên web
- ✅ Xem metrics, performance

**Nhược điểm:**
- ⚠️ Chỉ dùng cho MongoDB Atlas (cloud)
- ⚠️ Giao diện hạn chế hơn Compass

### 2.3. MongoDB Shell (mongosh) - Command Line

**Cài đặt:**
- Đã có sẵn khi cài MongoDB
- Hoặc tải: [mongodb.com/try/download/shell](https://www.mongodb.com/try/download/shell)

**Cách sử dụng:**

```bash
# Kết nối với local MongoDB
mongosh

# Hoặc kết nối với connection string
mongosh "mongodb://localhost:27017/student-accommodation"

# Kết nối với Atlas
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/student-accommodation"
```

**Các lệnh cơ bản:**

```javascript
// Xem databases
show dbs

// Chọn database
use student-accommodation

// Xem collections
show collections

// Xem tất cả documents trong collection
db.users.find()
db.listings.find()

// Tìm kiếm
db.users.find({ email: "user@example.com" })
db.listings.find({ price: { $gte: 2000000 } })

// Đếm số documents
db.users.countDocuments()
db.listings.countDocuments({ status: "available" })

// Thêm document
db.users.insertOne({
  name: "Test User",
  email: "test@example.com",
  role: "tenant"
})

// Cập nhật
db.users.updateOne(
  { email: "test@example.com" },
  { $set: { name: "Updated Name" } }
)

// Xóa
db.users.deleteOne({ email: "test@example.com" })

// Xóa tất cả (cẩn thận!)
db.users.deleteMany({})
```

**Ưu điểm:**
- ✅ Nhanh, mạnh mẽ
- ✅ Script tự động hóa
- ✅ Phù hợp cho advanced users

**Nhược điểm:**
- ⚠️ Cần biết cú pháp
- ⚠️ Không có giao diện trực quan

### 2.4. Studio 3T (GUI - Trả phí, có bản free)

**Tải về:**
- [studio3t.com](https://studio3t.com/)
- Có bản free (Studio 3T Free)

**Ưu điểm:**
- ✅ Nhiều tính năng mạnh
- ✅ SQL query cho MongoDB
- ✅ Import/Export tốt

---

## 3. Hướng dẫn Quản lý Database Chi tiết

### 3.1. Xem dữ liệu

**Trong MongoDB Compass:**

1. Mở Compass → Connect
2. Chọn database: `student-accommodation`
3. Chọn collection (VD: `listings`)
4. Xem danh sách documents
5. Click vào document để xem chi tiết

**Filter/Tìm kiếm:**
- Dùng filter bar ở trên
- VD: `{ "status": "available" }` để tìm phòng còn trống
- VD: `{ "price": { "$gte": 2000000 } }` để tìm phòng >= 2 triệu

### 3.2. Thêm dữ liệu

**Cách 1: Qua Compass**
1. Chọn collection
2. Click "INSERT DOCUMENT"
3. Nhập JSON:
```json
{
  "title": "Phòng trọ đẹp",
  "price": 2000000,
  "status": "available"
}
```
4. Click "Insert"

**Cách 2: Qua Code (API)**
- Sử dụng các API endpoints trong `backend/routes/`
- VD: `POST /api/listings` để thêm listing mới

**Cách 3: Qua mongosh**
```javascript
db.listings.insertOne({
  title: "Phòng trọ đẹp",
  price: 2000000,
  status: "available"
})
```

### 3.3. Sửa dữ liệu

**Cách 1: Qua Compass**
1. Tìm document cần sửa
2. Click vào document
3. Click "Update"
4. Sửa JSON
5. Click "Update"

**Cách 2: Qua mongosh**
```javascript
db.listings.updateOne(
  { _id: ObjectId("...") },
  { $set: { price: 2500000 } }
)
```

### 3.4. Xóa dữ liệu

**Cách 1: Qua Compass**
1. Tìm document cần xóa
2. Click vào document
3. Click "Delete"
4. Confirm

**Cách 2: Qua mongosh**
```javascript
// Xóa 1 document
db.listings.deleteOne({ _id: ObjectId("...") })

// Xóa nhiều documents
db.listings.deleteMany({ status: "hidden" })
```

### 3.5. Backup và Restore

**Backup (Export):**

```bash
# Export toàn bộ database
mongodump --uri="mongodb://localhost:27017/student-accommodation" --out=./backup

# Export collection cụ thể
mongodump --uri="mongodb://localhost:27017/student-accommodation" --collection=listings --out=./backup
```

**Restore (Import):**

```bash
# Restore toàn bộ database
mongorestore --uri="mongodb://localhost:27017/student-accommodation" ./backup/student-accommodation

# Restore collection cụ thể
mongorestore --uri="mongodb://localhost:27017/student-accommodation" --collection=listings ./backup/student-accommodation/listings.bson
```

**Qua Compass:**
- File → Export Collection → Chọn format (JSON, CSV)
- File → Import Collection → Chọn file

### 3.6. Xóa toàn bộ dữ liệu (Reset Database)

**⚠️ CẢNH BÁO: Thao tác này sẽ xóa TẤT CẢ dữ liệu!**

```javascript
// Trong mongosh
use student-accommodation

// Xóa tất cả collections
db.users.deleteMany({})
db.listings.deleteMany({})
db.reviews.deleteMany({})
db.blogs.deleteMany({})
db.notifications.deleteMany({})
db.mapdatas.deleteMany({})

// Hoặc xóa toàn bộ database
db.dropDatabase()
```

---

## 4. Cấu trúc Database

### 4.1. Database: `student-accommodation`

### 4.2. Collections và Schema

**users:**
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: "tenant" | "landlord" | "admin",
  phone: String,
  avatar: String,
  verified: Boolean,
  savedListings: [ObjectId], // References to listings
  createdAt: Date,
  updatedAt: Date
}
```

**listings:**
```javascript
{
  _id: ObjectId,
  landlord: ObjectId, // Reference to User
  title: String,
  description: String,
  price: Number,
  location: {
    address: String,
    district: String,
    city: String,
    coordinates: {
      type: "Point",
      coordinates: [lng, lat] // GeoJSON
    }
  },
  roomDetails: {
    area: Number,
    capacity: Number,
    bedrooms: Number,
    bathrooms: Number,
    roomType: "single" | "shared" | "apartment" | "house"
  },
  images: [String],
  status: "available" | "rented" | "hidden",
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**reviews:**
```javascript
{
  _id: ObjectId,
  listing: ObjectId, // Reference to Listing
  reviewer: ObjectId, // Reference to User
  rating: {
    overall: Number (1-5),
    cleanliness: Number,
    location: Number,
    value: Number
  },
  comment: String,
  createdAt: Date
}
```

---

## 5. Troubleshooting

### 5.1. Không kết nối được MongoDB

**Kiểm tra:**
1. MongoDB đã chạy chưa?
   ```bash
   # Windows
   net start MongoDB
   
   # Linux/Mac
   sudo systemctl status mongod
   ```

2. Connection string đúng chưa?
   - Kiểm tra file `.env` trong `backend/`
   - Format: `mongodb://localhost:27017/student-accommodation`

3. Port 27017 có bị block không?
   ```bash
   # Windows
   netstat -an | findstr 27017
   
   # Linux/Mac
   lsof -i :27017
   ```

### 5.2. Lỗi Authentication

- Kiểm tra username/password trong connection string (nếu dùng Atlas)
- Kiểm tra IP whitelist trong Atlas

### 5.3. Database không có dữ liệu

- Kiểm tra xem có đúng database name không
- Kiểm tra collections có tồn tại không
- Thử tạo document mới qua Compass

---

## 6. Best Practices

### 6.1. Bảo mật

- ✅ Không commit file `.env` lên Git
- ✅ Dùng password mạnh cho database user
- ✅ Whitelist IP trong Atlas (không dùng 0.0.0.0/0 cho production)
- ✅ Backup định kỳ

### 6.2. Performance

- ✅ Tạo indexes cho các trường thường query
- ✅ Dùng `select()` để chỉ lấy fields cần thiết
- ✅ Dùng pagination cho large collections
- ✅ Monitor slow queries

### 6.3. Maintenance

- ✅ Backup định kỳ (hàng ngày/tuần)
- ✅ Monitor database size
- ✅ Clean up old data
- ✅ Update MongoDB version

---

## 7. Tài liệu tham khảo

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Compass Guide](https://docs.mongodb.com/compass/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

---

**Khuyến nghị:** Sử dụng **MongoDB Compass** để quản lý database vì dễ sử dụng và có đầy đủ tính năng! 🎯

