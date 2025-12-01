# Hướng dẫn xử lý sự cố

## Vấn đề: Trang web không hiển thị khi mở http://localhost:5173/

### Bước 1: Kiểm tra Console của trình duyệt

1. Mở trình duyệt (Chrome/Firefox/Edge)
2. Nhấn **F12** hoặc **Ctrl+Shift+I** để mở Developer Tools
3. Chuyển sang tab **Console**
4. Xem có lỗi màu đỏ nào không

**Các lỗi thường gặp:**

#### Lỗi: "Failed to fetch user" hoặc "Network Error"
- **Nguyên nhân**: Backend không chạy hoặc không kết nối được
- **Giải pháp**: 
  - Kiểm tra backend có đang chạy trên port 5000 không
  - Mở http://localhost:5000/api/health để kiểm tra
  - Đảm bảo MongoDB đang chạy

#### Lỗi: "Cannot find module" hoặc "Module not found"
- **Nguyên nhân**: Dependencies chưa được cài đặt
- **Giải pháp**:
  ```cmd
  cd frontend
  npm install
  ```

#### Lỗi: "Uncaught SyntaxError" hoặc "Unexpected token"
- **Nguyên nhân**: Lỗi cú pháp trong code
- **Giải pháp**: Kiểm tra file có lỗi và sửa

### Bước 2: Kiểm tra Network Tab

1. Trong Developer Tools, chuyển sang tab **Network**
2. Refresh trang (F5)
3. Xem các request có thành công (status 200) không

**Các vấn đề thường gặp:**

- **Request đến `/api/auth/me` bị lỗi 404 hoặc 500**
  - Backend chưa chạy hoặc route không đúng
  - Kiểm tra backend/server.js có đang chạy không

- **Request bị CORS error**
  - Kiểm tra CORS đã được cấu hình trong backend/server.js
  - Đảm bảo `CLIENT_URL` trong backend/.env đúng

### Bước 3: Kiểm tra Terminal/Console

Xem terminal nơi bạn chạy `npm run dev` có lỗi gì không:

**Lỗi thường gặp:**
- `Port 5173 is already in use` → Đổi port trong vite.config.ts
- `Cannot find module` → Chạy `npm install` trong thư mục frontend
- `SyntaxError` → Kiểm tra code có lỗi cú pháp

### Bước 4: Kiểm tra các file cấu hình

1. **Kiểm tra frontend/.env:**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

2. **Kiểm tra backend/.env:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/student-accommodation
   JWT_SECRET=your_secret_key
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

3. **Kiểm tra vite.config.ts:**
   - Port phải là 5173
   - Proxy phải trỏ đến http://localhost:5000

### Bước 5: Kiểm tra MongoDB

```cmd
net start MongoDB
```

Hoặc kiểm tra service MongoDB có đang chạy không.

### Bước 6: Thử các giải pháp

#### Giải pháp 1: Xóa cache và cài lại
```cmd
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
```

#### Giải pháp 2: Restart tất cả services
1. Dừng `npm run dev` (Ctrl+C)
2. Dừng MongoDB nếu cần
3. Khởi động lại MongoDB
4. Chạy lại `npm run dev`

#### Giải pháp 3: Kiểm tra firewall
- Đảm bảo firewall không chặn port 5173 và 5000

### Bước 7: Kiểm tra trang có đang load không

1. Mở http://localhost:5173/
2. Nhấn **Ctrl+U** để xem source code
3. Nếu thấy HTML thì trang đang load, vấn đề có thể là JavaScript
4. Nếu không thấy gì, vấn đề là server không chạy

### Debug nâng cao

#### Thêm console.log để debug:
Trong `frontend/src/main.tsx`, thêm:
```typescript
console.log('App is loading...');
```

Trong `frontend/src/App.tsx`, thêm:
```typescript
console.log('App component rendered');
```

#### Kiểm tra React DevTools:
1. Cài extension React Developer Tools cho trình duyệt
2. Mở tab Components để xem component tree

### Liên hệ hỗ trợ

Nếu vẫn không giải quyết được, cung cấp:
1. Screenshot lỗi trong Console
2. Screenshot lỗi trong Network tab
3. Log từ terminal khi chạy `npm run dev`
4. Nội dung file `.env` (ẩn thông tin nhạy cảm)

