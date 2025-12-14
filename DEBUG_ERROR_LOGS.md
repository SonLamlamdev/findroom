# Cách Xem Error Logs Chi Tiết

## 1. Trên Render Dashboard

### Backend Logs (Quan trọng nhất)
1. **Vào Render Dashboard**: https://dashboard.render.com
2. **Chọn Backend Service** của bạn
3. **Click tab "Logs"** ở thanh menu trên cùng
4. **Xem real-time logs**: Logs sẽ hiển thị mọi output từ server, bao gồm:
   - Console.log
   - Console.error
   - Console.warn
   - Error stack traces

### Tìm Error Message:
- **Search trong logs**: Dùng Ctrl+F (hoặc Cmd+F trên Mac) để tìm:
  - `❌ Cloudinary configuration error`
  - `Error:`
  - `at Error`
  - Stack trace lines

### Xem Logs Lịch Sử:
- Render lưu logs trong vài ngày
- Scroll xuống để xem logs cũ hơn
- Có thể filter theo thời gian

---

## 2. Trong Code (Local Development)

### Khi chạy `npm run dev`:
- Tất cả errors sẽ hiển thị trong terminal
- Stack traces đầy đủ sẽ được in ra

### Debug Mode:
Thêm vào đầu file `server.js`:
```javascript
if (process.env.NODE_ENV !== 'production') {
  // Show full error details
  process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
  });
}
```

---

## 3. Browser Console (Frontend Errors)

### Nếu lỗi liên quan đến frontend:
1. **Mở Browser Developer Tools**:
   - Chrome/Edge: `F12` hoặc `Ctrl+Shift+I`
   - Firefox: `F12` hoặc `Ctrl+Shift+K`
2. **Chọn tab "Console"**
3. **Tìm errors màu đỏ**
4. **Click vào error để xem chi tiết**

### Network Tab:
- Mở tab **Network**
- Reload page
- Tìm request bị fail (màu đỏ)
- Click vào request → tab **Response** để xem error message từ server

---

## 4. Render Logs Export (Nếu cần)

### Cách export logs từ Render:
1. Vào Backend Service → Logs
2. Select text trong logs (Ctrl+A để chọn tất cả)
3. Copy (Ctrl+C)
4. Paste vào file text để phân tích

---

## 5. Cải Thiện Error Logging trong Code

### File: `backend/middleware/upload.js`
Code đã được cập nhật để log:
- ✅ Error message
- ✅ Stack trace
- ✅ Error name
- ✅ Error code

### File: `backend/server.js`
Global error handler đã log:
- ✅ Request URL
- ✅ Request method
- ✅ Request body
- ✅ Request params
- ✅ Request query
- ✅ Error message
- ✅ Error stack

---

## 6. Các Error Thường Gặp và Cách Tìm

### Cloudinary Errors:
**Tìm trong logs:**
```
❌ Cloudinary configuration error
⚠️ Cloudinary configuration error
```

### Database Errors:
**Tìm trong logs:**
```
MongoError
MongooseError
Connection failed
```

### API Errors:
**Tìm trong logs:**
```
❌ Error:
Request failed
500
```

---

## 7. Tips để Debug Hiệu Quả

1. **Filter logs trên Render**:
   - Render logs có thể rất dài
   - Dùng Ctrl+F để tìm keywords như: "Error", "failed", "❌"

2. **Check timestamp**:
   - Errors thường xảy ra ngay khi server start
   - Tìm timestamp gần nhất với thời điểm deploy

3. **Full stack trace**:
   - Đảm bảo xem đầy đủ stack trace (không chỉ message)
   - Stack trace sẽ chỉ ra file và dòng code bị lỗi

4. **Environment variables**:
   - Check xem các env vars đã được set đúng chưa
   - Logs sẽ không hiển thị giá trị của env vars (security)

---

## 8. Ví Dụ Error Log Format

### Error trong logs sẽ trông như này:
```
❌ Cloudinary configuration error:
   Message: CloudinaryStorage is not a constructor
   Stack: Error: CloudinaryStorage is not a constructor
       at Object.<anonymous> (/opt/render/project/src/backend/middleware/upload.js:39:30)
       at Module._compile (node:internal/modules/cjs/loader:1239:14)
       ...
   Error Name: TypeError
   Error Code: undefined
```

### Hoặc:
```
❌ Error: {
  message: 'Cannot find module \'cloudinary\'',
  stack: 'Error: Cannot find module \'cloudinary\'...',
  url: '/api/users/saved-listings',
  method: 'GET',
  ...
}
```

---

## 9. Nếu Không Tìm Thấy Error Message

### Các bước tiếp theo:
1. **Check xem server có đang chạy không**
   - Vào Render Dashboard → Service status phải là "Live"

2. **Check build logs**:
   - Vào tab "Events" hoặc "Deployments"
   - Xem build process có thành công không

3. **Restart service**:
   - Click "Manual Deploy" → "Clear build cache & deploy"
   - Xem logs trong quá trình restart

4. **Check package installation**:
   - Vào build logs
   - Tìm `npm install` output
   - Check xem có packages nào bị fail không

---

## 10. Liên Hệ Support

Nếu vẫn không tìm thấy error:
1. **Copy full stack trace** từ logs
2. **Copy error message** chính xác
3. **Gửi kèm**:
   - Timestamp của error
   - Action đang làm khi error xảy ra
   - Service URL
