# 🧪 Hướng dẫn Test Upload Images

## 📋 Checklist trước khi test

- [ ] Backend đang chạy (`npm run dev` trong thư mục `backend/`)
- [ ] Frontend đang chạy (`npm run dev` trong thư mục `frontend/`)
- [ ] Đã login vào tài khoản
- [ ] Có ít nhất một image để test upload

## 🧪 Test 1: Upload Image trong Create Listing

### Bước 1: Tạo listing mới
1. Đăng nhập với tài khoản **landlord** hoặc **admin**
2. Vào trang **"Đăng bài"** (Create Listing)
3. Điền đầy đủ thông tin:
   - Tiêu đề
   - Mô tả
   - Giá thuê
   - Chọn vị trí trên bản đồ
   - Diện tích
   - Các thông tin khác

### Bước 2: Upload images
1. Click vào phần upload images
2. Chọn 1-10 images (hoặc videos)
3. Xem preview images có hiển thị không

### Bước 3: Submit và kiểm tra
1. Click **"Đăng bài"**
2. Kiểm tra console (F12 → Console):
   - Có lỗi nào không?
   - Response từ server có chứa image URLs không?
3. Sau khi tạo xong:
   - Vào trang **"Danh sách phòng trọ"**
   - Tìm listing vừa tạo
   - **Kiểm tra: Images có hiển thị không?**

### Bước 4: Kiểm tra Network
1. Mở **DevTools → Network tab**
2. Filter: **"Img"** (chỉ xem images)
3. Reload trang listing detail
4. Xem các image requests:
   - **Status code** phải là 200 (success)
   - **URL** phải đúng format:
     - Local: `http://localhost:5000/uploads/...` hoặc relative `/uploads/...`
     - Cloudinary: `https://res.cloudinary.com/...`
     - Production: `https://your-backend.com/uploads/...` (nếu có VITE_API_URL)

## 🧪 Test 2: Upload Avatar

### Bước 1: Vào Profile
1. Click vào avatar trên Navbar
2. Chọn **"Hồ sơ"** (Profile)

### Bước 2: Upload avatar
1. Tìm phần upload avatar (nếu có)
2. Hoặc vào **Settings** (nếu có)
3. Upload một image làm avatar
4. Save

### Bước 3: Kiểm tra
1. Avatar có thay đổi không?
2. Avatar có hiển thị trên Navbar không?
3. Avatar có hiển thị trong Messages không?
4. Kiểm tra Network tab xem avatar request có thành công không?

## 🧪 Test 3: Upload Images trong Blog

### Bước 1: Tạo blog post
1. Vào trang **"Blog & Cộng đồng"**
2. Click **"Viết bài"**
3. Điền thông tin bài viết

### Bước 2: Upload images
1. Upload images cho blog
2. Submit

### Bước 3: Kiểm tra
1. Vào trang blog post vừa tạo
2. Images có hiển thị không?
3. Kiểm tra Network tab

## 🐛 Troubleshooting

### ❌ Images không hiển thị

#### Kiểm tra 1: Backend có serve static files không?
```javascript
// Trong backend/server.js phải có:
app.use('/uploads', express.static('uploads'));
```

#### Kiểm tra 2: Files có được upload không?
- Kiểm tra thư mục `backend/uploads/` có files mới không
- Nếu dùng Cloudinary, kiểm tra Cloudinary Dashboard

#### Kiểm tra 3: Environment variables
**Local development:**
- Không cần `VITE_API_URL` (dùng Vite proxy)

**Production:**
- Phải set `VITE_API_URL` trên Vercel/hosting
- Format: `VITE_API_URL=https://your-backend.com` (không có `/` ở cuối)

#### Kiểm tra 4: Console errors
- Mở DevTools → Console
- Xem có lỗi CORS không?
- Xem có lỗi 404 không?
- Xem có lỗi network không?

#### Kiểm tra 5: Image URLs trong database
- Kiểm tra database xem image paths có đúng không
- Nếu dùng local storage: paths phải là `/uploads/filename.jpg`
- Nếu dùng Cloudinary: paths phải là full URL `https://res.cloudinary.com/...`

### ❌ Upload bị fail

#### Lỗi: "File too large"
- Kiểm tra `MAX_FILE_SIZE` trong `.env`
- Default: 10MB
- Tăng lên nếu cần: `MAX_FILE_SIZE=20971520` (20MB)

#### Lỗi: "File type not allowed"
- Kiểm tra file extension
- Chỉ chấp nhận: jpg, png, gif, webp, mp4, mov, etc.
- Xem danh sách đầy đủ trong `backend/middleware/upload.js`

#### Lỗi: Network error
- Kiểm tra backend có đang chạy không
- Kiểm tra CORS settings
- Kiểm tra URL trong axios config

### ✅ Success Checklist

Sau khi test thành công, bạn sẽ thấy:
- ✅ Images upload thành công
- ✅ Images hiển thị trên frontend
- ✅ No errors trong console
- ✅ Status 200 trong Network tab
- ✅ Image URLs đúng format

## 📊 Test Results Template

Sử dụng template này để ghi lại kết quả test:

```
Date: ___________
Tester: ___________

Test 1: Create Listing Upload
- [ ] Upload thành công
- [ ] Images hiển thị trong listing card
- [ ] Images hiển thị trong listing detail
- [ ] Network requests: Success/Failed
- [ ] Console errors: None/Errors

Test 2: Avatar Upload
- [ ] Upload thành công
- [ ] Avatar hiển thị trên Navbar
- [ ] Avatar hiển thị trong Messages
- [ ] Network requests: Success/Failed

Test 3: Blog Upload
- [ ] Upload thành công
- [ ] Images hiển thị trong blog post
- [ ] Network requests: Success/Failed

Issues Found:
1. ___________
2. ___________

Notes:
___________
```

---

*Sau khi test xong, nếu có vấn đề, check lại các bước troubleshooting ở trên!*
