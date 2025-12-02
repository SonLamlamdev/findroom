# Kiểm tra Cấu hình Backend và Frontend

## Thông tin hiện tại

- **Backend URL (Render)**: `https://findroom-qd83.onrender.com`
- **Frontend URL (Vercel)**: `https://findroom2-sonlamlamdevs-projects.vercel.app`

## Bước 1: Kiểm tra Backend đang chạy

Mở trình duyệt và truy cập:
```
https://findroom-qd83.onrender.com/api/health
```

**Kết quả mong đợi:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

Nếu thấy kết quả này → ✅ Backend đang chạy tốt

Nếu không truy cập được → ❌ Backend chưa deploy hoặc đã bị tắt

---

## Bước 2: Cấu hình trên Render (Backend)

### 2.1. Vào Render Dashboard
1. Truy cập [render.com](https://render.com)
2. Đăng nhập và chọn service backend của bạn

### 2.2. Cấu hình Environment Variables
Vào **Environment** tab và thêm/cập nhật các biến sau:

```
CLIENT_URL=https://your-frontend-url.vercel.app
```
**Lưu ý:** Thay `your-frontend-url.vercel.app` bằng URL frontend thực tế của bạn

**Các biến môi trường khác cần có:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-key-here
PORT=10000
NODE_ENV=production
```

### 2.3. Redeploy Backend
Sau khi cập nhật environment variables, click **Manual Deploy** → **Deploy latest commit**

---

## Bước 3: Cấu hình trên Vercel (Frontend)

### 3.1. Vào Vercel Dashboard
1. Truy cập [vercel.com](https://vercel.com)
2. Chọn project frontend của bạn

### 3.2. Cấu hình Environment Variables
Vào **Settings** → **Environment Variables** và thêm:

```
VITE_API_URL=https://findroom-qd83.onrender.com
```

**Lưu ý quan trọng:**
- ✅ Đúng: `https://findroom-qd83.onrender.com`
- ❌ Sai: `https://findroom-qd83.onrender.com/` (có dấu / ở cuối)
- ❌ Sai: `http://findroom-qd83.onrender.com` (thiếu s)

### 3.3. Redeploy Frontend
Sau khi cập nhật, vào **Deployments** → Chọn deployment mới nhất → Click **Redeploy**

---

## Bước 4: Kiểm tra Console trong Browser

1. Mở frontend URL trong browser
2. Mở Developer Tools (F12)
3. Vào tab **Console**
4. Kiểm tra các thông báo:

**Nếu thấy:**
```
🔧 API URL: https://findroom-qd83.onrender.com
```
→ ✅ Cấu hình đúng

**Nếu thấy:**
```
⚠️ VITE_API_URL is not set in production!
```
→ ❌ Chưa cấu hình `VITE_API_URL` trên Vercel

**Nếu thấy lỗi 404:**
```
❌ 404 Error: { url: '/api/listings', ... }
```
→ Kiểm tra:
- `VITE_API_URL` đã được set chưa?
- URL backend có đúng không?
- Backend có đang chạy không?

---

## Bước 5: Kiểm tra Network Tab

1. Mở Developer Tools (F12)
2. Vào tab **Network**
3. Reload trang
4. Tìm các request đến `/api/...`

**Kiểm tra:**
- **Request URL**: Phải là `https://findroom-qd83.onrender.com/api/...`
- **Status**: Phải là `200` (không phải `404`)
- **CORS Headers**: Phải có `Access-Control-Allow-Origin`

---

## Troubleshooting

### Lỗi: CORS blocked
**Nguyên nhân:** Frontend URL chưa được thêm vào `CLIENT_URL` trên Render

**Giải pháp:**
1. Vào Render → Environment Variables
2. Cập nhật `CLIENT_URL` = URL frontend của bạn
3. Redeploy backend

### Lỗi: 404 Not Found
**Nguyên nhân:** `VITE_API_URL` chưa được cấu hình hoặc sai

**Giải pháp:**
1. Vào Vercel → Settings → Environment Variables
2. Thêm `VITE_API_URL=https://findroom-qd83.onrender.com`
3. Redeploy frontend

### Lỗi: Network Error / Connection Refused
**Nguyên nhân:** Backend chưa chạy hoặc đã bị tắt

**Giải pháp:**
1. Kiểm tra backend trên Render có đang "Live" không
2. Render free tier có thể sleep sau 15 phút không có traffic
3. Gửi một request đến backend để "đánh thức" nó

---

## Checklist

- [ ] Backend health check trả về `{"status":"OK"}`
- [ ] `CLIENT_URL` đã được set trên Render = URL frontend
- [ ] `VITE_API_URL` đã được set trên Vercel = `https://findroom-qd83.onrender.com`
- [ ] Đã redeploy cả backend và frontend sau khi cập nhật
- [ ] Console không có lỗi về API URL
- [ ] Network tab cho thấy requests đến đúng backend URL
- [ ] Không có lỗi CORS

---

## Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề, cung cấp:
1. Screenshot của Console errors
2. Screenshot của Network tab (failed requests)
3. Backend logs từ Render
4. Frontend URL của bạn

