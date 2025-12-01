# Tài liệu Tính năng - Student Accommodation Platform

## Tổng quan

Nền tảng tìm trọ thông minh dành riêng cho sinh viên với đầy đủ tính năng hiện đại.

---

## 🏠 I. Tính năng cho Chủ trọ

### 1. Quản lý tin đăng
- ✅ **Đăng tin mới** với ảnh/video (tối đa 10 file)
- ✅ **Chỉnh sửa tin** bất kỳ lúc nào
- ✅ **Ẩn/Hiện tin** linh hoạt
- ✅ **Xóa tin** khi không cần thiết
- ✅ **Xem phản hồi** từ người xem (đánh giá, bình luận)

**Endpoint API:**
- POST `/api/listings` - Tạo tin mới
- PUT `/api/listings/:id` - Cập nhật tin
- PATCH `/api/listings/:id/status` - Thay đổi trạng thái
- DELETE `/api/listings/:id` - Xóa tin

### 2. Dashboard thống kê

#### Các chỉ số hiển thị:

##### 📊 Lượt xem
- Tổng lượt xem trong tuần/tháng
- Biểu đồ theo ngày
- So sánh với kỳ trước

##### ❤️ Lượt lưu
- Số sinh viên đã lưu tin của bạn
- Danh sách người quan tâm

##### 💰 So sánh giá
- Giá trung bình của bạn
- Giá trung bình khu vực
- % chênh lệch
- Gợi ý điều chỉnh giá

##### 🔍 Từ khóa tìm kiếm
- Top 10 từ khóa
- Số lần xuất hiện
- Biểu đồ phân tích

**Endpoint API:**
- GET `/api/dashboard/stats?period=week|month|year`
- GET `/api/dashboard/listing/:id/analytics`

### 3. Xác thực & Huy hiệu
- ✅ Tick xanh "Chủ trọ uy tín"
- ✅ Hệ thống đánh giá từ người thuê
- ✅ Tỷ lệ phản hồi

---

## 👤 II. Tính năng cho Người thuê

### 1. Tìm kiếm & Lọc phòng

#### Bộ lọc nâng cao:
- **Giá**: Min - Max
- **Loại phòng**: Đơn, Ghép, Căn hộ, Nhà nguyên căn
- **Vị trí**: Thành phố, Quận/Huyện
- **Diện tích**: m²
- **Gần trường**: Tên trường đại học
- **Tiện nghi**: Điều hòa, Wifi, Bãi xe, v.v.

**Endpoint API:**
- GET `/api/listings?search=...&minPrice=...&maxPrice=...&roomType=...`

### 2. Xem chi tiết phòng
- ✅ Gallery ảnh/video
- ✅ Thông tin đầy đủ
- ✅ Vị trí trên bản đồ
- ✅ Thông tin chủ trọ
- ✅ Đánh giá từ người thuê khác
- ✅ Nút liên hệ, lưu tin

### 3. Lưu phòng yêu thích
- ✅ Giỏ hàng/Wishlist
- ✅ Quản lý danh sách đã lưu
- ✅ So sánh nhiều phòng

**Endpoint API:**
- POST `/api/users/saved-listings/:listingId`
- GET `/api/users/saved-listings`

### 4. Đánh giá & Review
- ✅ Đánh giá 5 sao
- ✅ Viết review chi tiết
- ✅ Upload ảnh thực tế
- ✅ Chia sẻ ưu/nhược điểm
- ✅ Chủ trọ phản hồi review

**Endpoint API:**
- POST `/api/reviews`
- GET `/api/reviews/listing/:listingId`
- POST `/api/reviews/:id/helpful`

---

## 🌍 III. Tính năng đặc trưng

### 1. Bản đồ tương tác

#### 4 lớp dữ liệu:

##### 💰 Lớp Giá thuê
- Màu xanh: Giá thấp (< 2tr)
- Màu vàng: Giá trung bình (2-4tr)  
- Màu đỏ: Giá cao (> 4tr)

##### 🛡️ Lớp An ninh
- Màu xanh: An toàn
- Màu vàng: Trung bình
- Màu đỏ: Cần cẩn trọng
- Dựa trên đánh giá cộng đồng

##### 🏪 Lớp Tiện ích sinh viên
- Quán cơm bình dân
- Tiệm photocopy
- Trạm xe buýt
- Cửa hàng tiện lợi
- Điểm số tổng hợp

##### 🌊 Lớp Rủi ro ngập lụt
- Màu xanh: Rủi ro thấp
- Màu vàng: Rủi ro trung bình
- Màu đỏ: Rủi ro cao
- Lịch sử ngập lụt

**Công nghệ:**
- React Leaflet
- OpenStreetMap
- Heatmap overlay

**Endpoint API:**
- GET `/api/maps/listings?bounds=...`
- GET `/api/maps/area-data?bounds=...`
- GET `/api/maps/heatmap/:type`
- POST `/api/maps/update-area` (Community contribution)

### 2. Tìm bạn cùng phòng

#### Hồ sơ cá nhân bao gồm:
- 🎓 Trường & Chuyên ngành
- 😴 Thói quen sinh hoạt
  - Giấc ngủ: Ngủ sớm/muộn/linh hoạt
  - Độ sạch sẽ: 1-5 sao
  - Độ ồn: Yên tĩnh/Trung bình/Xã giao
  - Hút thuốc: Có/Không
  - Nuôi thú: Có/Không
  - Nấu ăn: Thường xuyên/Đôi khi/Hiếm
- 🎨 Sở thích
- 💵 Ngân sách mong muốn (Min-Max)
- 📝 Nhu cầu đặc biệt

#### Thuật toán matching:
```javascript
Độ tương thích = 
  30% Cùng trường
  25% Ngân sách phù hợp
  25% Thói quen giống nhau
  20% Sở thích chung
```

**Điểm tương thích:**
- 80-100%: Rất phù hợp ⭐⭐⭐
- 60-79%: Phù hợp ⭐⭐
- <60%: Ít phù hợp ⭐

**Endpoint API:**
- GET `/api/roommates/find` - Tìm gợi ý
- PUT `/api/users/roommate-profile` - Cập nhật hồ sơ
- GET `/api/roommates/:userId` - Xem hồ sơ người khác

### 3. Blog & Cộng đồng

#### Danh mục:
- 💡 **Mẹo hay**: Tips & tricks
- 📖 **Kinh nghiệm**: Chia sẻ trải nghiệm
- ✅ **Checklist xem phòng**: Hướng dẫn
- ⚠️ **Cảnh báo lừa đảo**: Report scam
- 💬 **Thảo luận**: Trao đổi chung

#### Tính năng:
- ✅ Viết bài với ảnh
- ✅ Like & Comment
- ✅ Lượt xem
- ✅ Tags
- ✅ Tìm kiếm theo danh mục

**Endpoint API:**
- GET `/api/blogs?category=...&search=...`
- POST `/api/blogs`
- POST `/api/blogs/:id/like`
- POST `/api/blogs/:id/comments`

---

## 🎯 IV. Tính năng bổ sung

### 1. Hệ thống người dùng

#### Đăng ký/Đăng nhập
- ✅ Email + Password
- ✅ Chọn vai trò (Tenant/Landlord)
- ✅ JWT Authentication
- ✅ Remember me

#### Hồ sơ cá nhân
- ✅ Avatar
- ✅ Thông tin cơ bản
- ✅ Số điện thoại
- ✅ Hồ sơ tìm bạn cùng phòng

**Endpoint API:**
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`
- PUT `/api/users/profile`

### 2. Hỗ trợ đa ngôn ngữ
- 🇻🇳 Tiếng Việt (Mặc định)
- 🇬🇧 English
- Sử dụng i18next

### 3. Chế độ sáng/tối
- ☀️ Light mode
- 🌙 Dark mode
- Lưu preference

### 4. Thông báo Real-time
- ✅ Socket.io
- ✅ Thông báo tin nhắn mới
- ✅ Thông báo đánh giá
- ✅ Thông báo roommate match
- ✅ Badge số lượng chưa đọc

**Endpoint API:**
- GET `/api/notifications`
- PUT `/api/notifications/:id/read`
- PUT `/api/notifications/read-all`

### 5. Upload File
- ✅ Ảnh: JPG, PNG, GIF
- ✅ Video: MP4, MOV, AVI
- ✅ Max 10MB/file
- ✅ Multer middleware
- ✅ Lưu local `/uploads/`

### 6. Search & Filter
- ✅ Full-text search
- ✅ Multiple filters
- ✅ Pagination
- ✅ Sorting

### 7. Security
- ✅ Helmet.js
- ✅ Rate limiting
- ✅ Input validation
- ✅ JWT secret
- ✅ Password hashing (bcrypt)

### 8. Admin Features
- ✅ Ban/Unban users
- ✅ Verify landlords
- ✅ Moderate content
- ✅ View all statistics

**Endpoint API:**
- POST `/api/users/ban/:userId`
- POST `/api/users/unban/:userId`

---

## 📱 V. Responsive Design

Tất cả trang đều responsive trên:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

---

## 🎨 VI. UI/UX Features

### Design System
- ✅ Tailwind CSS
- ✅ Custom components
- ✅ Consistent spacing
- ✅ Color palette
- ✅ Typography scale

### Animations
- ✅ Page transitions
- ✅ Hover effects
- ✅ Loading states
- ✅ Smooth scrolling

### Accessibility
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Color contrast

---

## 🚀 VII. Performance

### Frontend
- ⚡ Vite - Fast build
- ⚡ Code splitting
- ⚡ Lazy loading
- ⚡ Image optimization

### Backend
- ⚡ MongoDB indexing
- ⚡ Response caching
- ⚡ Query optimization
- ⚡ Pagination

---

## 📊 VIII. Analytics & Tracking

### Chủ trọ có thể xem:
- 📈 Views over time
- 📈 Conversion rate
- 📈 Popular search keywords
- 📈 User engagement

### Platform có thể track:
- 📊 Total users
- 📊 Total listings
- 📊 Active searches
- 📊 Popular areas

---

## 🔮 IX. Tính năng có thể mở rộng

### Future enhancements:
- 💳 Payment integration
- 📧 Email notifications
- 📞 In-app messaging
- 🤖 AI-powered recommendations
- 📱 Mobile app (React Native)
- 🔔 Push notifications
- 📸 Virtual tours (360°)
- 📝 Digital contracts
- ⭐ Loyalty program
- 🎁 Referral system

---

## 📖 X. Documentation

- ✅ API Documentation (REST)
- ✅ Component Documentation
- ✅ Installation Guide
- ✅ User Guide
- ✅ Developer Guide

---

Tất cả tính năng đã được implement đầy đủ và sẵn sàng sử dụng! 🎉








