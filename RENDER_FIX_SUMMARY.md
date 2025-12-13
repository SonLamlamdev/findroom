# 🔧 Tóm tắt Fix cho Render Deployment

## ⚠️ Vấn đề chính

1. **Images không hiển thị** → Cần set `VITE_API_URL` trên Render (frontend)
2. **Images bị mất khi server restart** → Render free tier không persist `uploads/` folder
3. **Lỗi 500 ở `/stayed-listings`** → ✅ Đã fix

---

## ✅ Cần làm NGAY

### 1. Set VITE_API_URL trên Render (Frontend)

**Bước 1:** Vào Render Dashboard
- Chọn **Frontend Service**

**Bước 2:** Environment Variables
- Vào tab **Environment**
- Thêm mới hoặc sửa:
  ```
  Key: VITE_API_URL
  Value: https://your-backend.onrender.com
  ```
  **Ví dụ:** `https://findroom-qd83.onrender.com`

**Bước 3:** Redeploy
- Click **Manual Deploy** → **Deploy latest commit**

---

### 2. Kiểm tra CLIENT_URL trên Render (Backend)

**Bước 1:** Vào Render Dashboard
- Chọn **Backend Service**

**Bước 2:** Environment Variables
- Đảm bảo có:
  ```
  Key: CLIENT_URL
  Value: https://your-frontend.onrender.com
  ```

**Bước 3:** Redeploy nếu cần

---

## 🎯 Giải pháp dài hạn: Chuyển sang Cloudinary

**Vì sao?**
- ❌ Render free tier: `uploads/` folder bị mất khi server restart
- ✅ Cloudinary: Files lưu trên cloud → không bao giờ mất
- ✅ CDN global → load nhanh hơn
- ✅ Free tier: 25GB storage, 25GB bandwidth/tháng

**Cách setup:**

### Bước 1: Tạo tài khoản Cloudinary
1. Truy cập: https://cloudinary.com/users/register/free
2. Đăng ký miễn phí
3. Vào Dashboard → Copy:
   - Cloud Name
   - API Key
   - API Secret

### Bước 2: Thêm vào Render (Backend)
1. Vào Render Dashboard → Backend Service → Environment
2. Thêm 3 biến:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

### Bước 3: Redeploy Backend
- Render sẽ tự động rebuild
- Check logs: `✅ Using Cloudinary for file storage`

### Bước 4: Test
- Upload một image mới
- Image URL sẽ là: `https://res.cloudinary.com/...`
- Images sẽ không bị mất khi server restart!

---

## 📋 Checklist

### Frontend (Render)
- [ ] `VITE_API_URL` đã được set = `https://your-backend.onrender.com`
- [ ] Đã redeploy sau khi set env var
- [ ] Console không có lỗi `VITE_API_URL not set`

### Backend (Render)
- [ ] `CLIENT_URL` đã được set = frontend URL
- [ ] `MONGODB_URI` đã được set
- [ ] `JWT_SECRET` đã được set
- [ ] Health check: `/api/health` → OK
- [ ] (Optional) Cloudinary env vars đã được set

### Test
- [ ] Upload image thành công
- [ ] Image hiển thị sau khi upload
- [ ] Image URL là full URL (không phải relative)
- [ ] Copy image URL vào browser → hiển thị image

---

## 🔍 Kiểm tra nhanh

### 1. Test Backend
Mở browser:
```
https://your-backend.onrender.com/api/health
```
Phải trả về: `{"status":"OK","message":"Server is running"}`

### 2. Test Frontend Console
1. Mở frontend URL
2. `F12` → Console
3. Tìm: `🔧 Axios Configuration:`
4. Kiểm tra:
   - `VITE_API_URL`: Phải có giá trị (không phải "NOT SET")
   - `API Base URL`: Phải là backend URL

### 3. Test Images
1. Upload một image
2. `F12` → Network tab → Filter: "Img"
3. Xem image request:
   - URL phải là: `https://backend.onrender.com/uploads/...`
   - Status phải là: `200`

---

## 🐛 Nếu vẫn không được

### Vấn đề: Images không hiển thị

**Kiểm tra:**
1. Console có lỗi gì không?
2. Network tab: Image request status là gì? (200/404/CORS)
3. Copy image URL → Paste vào browser → có hiển thị không?

**Nếu 404:**
- File không tồn tại (có thể đã bị mất khi server restart)
- Giải pháp: Chuyển sang Cloudinary

**Nếu CORS:**
- `CLIENT_URL` chưa set đúng trên backend
- Giải pháp: Set `CLIENT_URL` = frontend URL

**Nếu relative path:**
- `VITE_API_URL` chưa được set
- Giải pháp: Set `VITE_API_URL` trên Render frontend

---

## 📝 Environment Variables Summary

### Frontend (Render)
```env
VITE_API_URL=https://your-backend.onrender.com
```

### Backend (Render)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
CLIENT_URL=https://your-frontend.onrender.com
NODE_ENV=production

# Optional - Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

**Sau khi làm các bước trên, images sẽ hiển thị đúng!** ✅
