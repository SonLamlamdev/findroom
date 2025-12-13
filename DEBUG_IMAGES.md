# 🐛 Debug: Images không hiển thị

## ✅ Đã sửa

1. ✅ Route `/stayed-listings` - thêm error handling tốt hơn
2. ✅ Route reviews - cập nhật để dùng fileHelper cho images

## 🔍 Kiểm tra Images không hiển thị

### 1. Kiểm tra Console (F12)

Mở DevTools → Console và tìm:
- ❌ `404 Not Found` → Image path không đúng
- ❌ `CORS error` → Backend CORS settings
- ❌ `Network Error` → Backend không chạy hoặc URL sai

### 2. Kiểm tra Network Tab

1. Mở DevTools → Network
2. Filter: **Img**
3. Reload trang
4. Kiểm tra từng image request:
   - **Status**: Phải là `200` (success)
   - **URL**: Kiểm tra format:
     - Local: `http://localhost:5000/uploads/...` hoặc `/uploads/...`
     - Cloudinary: `https://res.cloudinary.com/...`
     - Production: `https://your-backend.com/uploads/...`

### 3. Kiểm tra Environment Variables

**Production (Vercel):**
```env
VITE_API_URL=https://your-backend.onrender.com
```
**Lưu ý:** KHÔNG có dấu `/` ở cuối!

**Local Development:**
- Không cần `VITE_API_URL` (dùng Vite proxy)

### 4. Kiểm tra Backend

#### Backend có serve static files?

Trong `backend/server.js` phải có:
```javascript
app.use('/uploads', express.static('uploads'));
```

#### Files có được upload không?

- **Local storage:** Kiểm tra `backend/uploads/` folder
- **Cloudinary:** Kiểm tra Cloudinary Dashboard → Media Library

#### Backend logs

Kiểm tra console khi upload image:
- Xem có lỗi gì không?
- Image path được trả về như thế nào?

### 5. Kiểm tra Database

Image paths trong database phải đúng format:
- **Local storage:** `/uploads/filename.jpg`
- **Cloudinary:** `https://res.cloudinary.com/your-cloud/...`

### 6. Test từng bước

#### Test 1: Upload mới
1. Upload một image mới
2. Kiểm tra response từ server
3. Xem image URL trong response
4. Copy URL và paste vào browser → có hiển thị không?

#### Test 2: Images cũ
1. Vào trang có images
2. Mở Network tab
3. Xem image request URLs
4. Copy URL → paste vào browser → có hiển thị không?

## 🔧 Các lỗi thường gặp

### ❌ Lỗi: 404 Not Found

**Nguyên nhân:**
- Backend không serve static files
- Image path sai
- File không tồn tại

**Giải pháp:**
```javascript
// backend/server.js
app.use('/uploads', express.static('uploads'));
```

### ❌ Lỗi: CORS

**Nguyên nhân:**
- Backend CORS chưa config đúng

**Giải pháp:**
Kiểm tra `backend/server.js` CORS settings

### ❌ Lỗi: Images không load trong production

**Nguyên nhân:**
- `VITE_API_URL` chưa được set
- Backend URL sai

**Giải pháp:**
1. Set `VITE_API_URL` trên Vercel
2. Format: `VITE_API_URL=https://your-backend.com` (không có `/`)

### ❌ Images hiển thị trong local nhưng không trong production

**Nguyên nhân:**
- Local dùng relative path (`/uploads/...`) → Vite proxy handle
- Production cần full URL

**Giải pháp:**
- Đảm bảo `getImageUrl()` helper được dùng
- Set `VITE_API_URL` trong production

## 📝 Checklist Debug

- [ ] Console không có lỗi
- [ ] Network tab: Image requests có status 200
- [ ] Image URLs đúng format
- [ ] Copy URL vào browser → image hiển thị
- [ ] Backend serve static files
- [ ] `VITE_API_URL` được set trong production
- [ ] Files tồn tại trong storage (local hoặc Cloudinary)

## 🎯 Quick Fix

Nếu images không hiển thị ngay:

1. **Kiểm tra Network tab** → xem URL và status
2. **Copy image URL** → paste vào browser
3. **Nếu 404:**
   - Kiểm tra backend có serve static files không
   - Kiểm tra file có tồn tại không
4. **Nếu CORS:**
   - Kiểm tra backend CORS settings
5. **Nếu production:**
   - Set `VITE_API_URL` trên Vercel

---

*Sau khi fix, images sẽ hiển thị đúng!* ✅
