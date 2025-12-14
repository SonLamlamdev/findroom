# 🔍 Kiểm tra Deployment trên Render

## ⚠️ Vấn đề với Render

### Vấn đề chính: Static Files trong `uploads/` folder

**Render free tier có những hạn chế:**
1. ✅ Backend code chạy tốt
2. ❌ **Static files (`uploads/`) sẽ bị mất khi server restart**
3. ⚠️ Server có thể sleep sau 15 phút không có traffic

### Giải pháp

**Option 1: Chuyển sang Cloudinary (Khuyến nghị)**
- Files được lưu trên cloud → không mất khi server restart
- CDN global → load nhanh hơn
- Free tier: 25GB storage, 25GB bandwidth/tháng

**Option 2: Dùng external storage khác**
- AWS S3
- Google Cloud Storage
- Vercel Blob Storage

---

## 📋 Checklist Kiểm tra trên Render

### Backend (Render)

#### 1. Environment Variables
Vào Render Dashboard → Backend Service → Environment:

**Bắt buộc phải có:**
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CLIENT_URL=https://your-frontend-url.onrender.com
```

**Để dùng Cloudinary (nếu muốn):**
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### 2. Build & Start Commands
**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

#### 3. Health Check
URL: `https://your-backend.onrender.com/api/health`

Phải trả về:
```json
{"status":"OK","message":"Server is running"}
```

#### 4. Static Files
**Kiểm tra:** 
- Backend có serve static files không?
- File `backend/server.js` phải có: `app.use('/uploads', express.static('uploads'));`

**⚠️ Lưu ý:** Files trong `uploads/` folder sẽ bị mất khi server restart trên Render free tier!

### Frontend (Render)

#### 1. Environment Variables
Vào Render Dashboard → Frontend Service → Environment:

**Bắt buộc phải có:**
```env
VITE_API_URL=https://your-backend.onrender.com
```

**⚠️ Quan trọng:**
- KHÔNG có dấu `/` ở cuối
- Phải dùng `https://` (không phải `http://`)
- Format: `VITE_API_URL=https://findroom-qd83.onrender.com`

#### 2. Build & Start Commands
**Build Command:**
```bash
cd frontend && npm install && npm run build
```

**Publish Directory:**
```
frontend/dist
```

**Start Command:**
```bash
cd frontend && npm run preview
```

Hoặc dùng static site:
**Start Command:**
```bash
npx serve -s dist -l 3000
```

#### 3. Root Directory (nếu deploy từ monorepo)
Nếu deploy từ root của repo:
- **Root Directory:** `frontend`

---

## 🔍 Kiểm tra Images không hiển thị

### Bước 1: Kiểm tra Console (Browser)

1. Mở website trên Render
2. Nhấn `F12` → Console tab
3. Tìm các message:
   - `⚠️ VITE_API_URL not set` → Cần set environment variable
   - `🔧 API Base URL: ...` → Kiểm tra URL có đúng không

### Bước 2: Kiểm tra Network Tab

1. `F12` → Network tab
2. Filter: **Img**
3. Reload trang
4. Kiểm tra image requests:

**Nếu thấy:**
- ❌ Status `404` → Image không tồn tại hoặc path sai
- ❌ Status `CORS error` → Backend CORS chưa config đúng
- ❌ URL là relative (`/uploads/...`) → Cần `VITE_API_URL`
- ✅ URL là full URL (`https://backend.onrender.com/uploads/...`) → OK

### Bước 3: Test Image URL

1. Copy một image URL từ Network tab
2. Paste vào browser
3. Nếu hiển thị image → OK
4. Nếu 404 → File không tồn tại (có thể đã bị mất khi server restart)

### Bước 4: Kiểm tra Backend Logs

Vào Render Dashboard → Backend → Logs:
- Xem có lỗi khi upload không?
- Xem có message về static files không?

---

## 🔧 Cách Fix

### Fix 1: Set VITE_API_URL trên Render (Frontend)

1. Vào Render Dashboard
2. Chọn Frontend Service
3. Vào **Environment** tab
4. Thêm environment variable:
   ```
   Key: VITE_API_URL
   Value: https://your-backend.onrender.com
   ```
5. **Redeploy** frontend (Render sẽ tự động rebuild)

### Fix 2: Kiểm tra CLIENT_URL trên Render (Backend)

1. Vào Render Dashboard
2. Chọn Backend Service
3. Vào **Environment** tab
4. Đảm bảo có:
   ```
   Key: CLIENT_URL
   Value: https://your-frontend.onrender.com
   ```

### Fix 3: Chuyển sang Cloudinary (Khuyến nghị)

Nếu images bị mất khi server restart, nên chuyển sang Cloudinary:

1. **Tạo tài khoản Cloudinary:**
   - https://cloudinary.com/users/register/free

2. **Thêm vào Backend Environment (Render):**
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

3. **Cài đặt packages (đã có trong code):**
   - Code đã hỗ trợ Cloudinary
   - Chỉ cần thêm env vars là xong

4. **Redeploy backend:**
   - Render sẽ tự động rebuild
   - Check logs: `✅ Using Cloudinary for file storage`

---

## 📊 Test Checklist

Sau khi fix, test:

- [ ] Backend health check: `https://backend.onrender.com/api/health` → OK
- [ ] Frontend load được
- [ ] Console không có lỗi `VITE_API_URL not set`
- [ ] Upload image thành công
- [ ] Image hiển thị sau khi upload
- [ ] Image URL là full URL (không phải relative)
- [ ] Copy image URL vào browser → hiển thị image

---

## 🐛 Troubleshooting

### ❌ Images upload được nhưng không hiển thị

**Nguyên nhân:**
- `VITE_API_URL` chưa được set trên Render (frontend)

**Giải pháp:**
1. Set `VITE_API_URL` trên Render frontend service
2. Redeploy frontend

### ❌ Images bị mất sau khi server restart

**Nguyên nhân:**
- Render free tier không persist `uploads/` folder

**Giải pháp:**
- Chuyển sang Cloudinary (khuyến nghị)
- Hoặc dùng external storage khác

### ❌ CORS error khi load images

**Nguyên nhân:**
- Backend `CLIENT_URL` chưa set đúng

**Giải pháp:**
1. Set `CLIENT_URL` trên Render backend = frontend URL
2. Redeploy backend

### ❌ Backend sleep (không respond)

**Nguyên nhân:**
- Render free tier sleep sau 15 phút không có traffic

**Giải pháp:**
- Đợi vài giây để server wake up
- Hoặc upgrade lên paid plan

---

## 📝 Environment Variables Summary

### Backend (Render)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CLIENT_URL=https://your-frontend.onrender.com
NODE_ENV=production

# Optional - để dùng Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend (Render)
```env
VITE_API_URL=https://your-backend.onrender.com
```

**Lưu ý:**
- KHÔNG có dấu `/` ở cuối
- Dùng `https://` (không phải `http://`)

---

*Sau khi kiểm tra và fix các vấn đề trên, images sẽ hiển thị đúng!* ✅
