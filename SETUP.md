# Hướng dẫn thiết lập và chạy dự án

## Bước 1: Kiểm tra và cài đặt dependencies

Mở **Command Prompt (CMD)** hoặc **PowerShell** và chạy:

```cmd
npm run install-all
```

Lệnh này sẽ cài đặt dependencies cho:
- Root project (concurrently)
- Backend
- Frontend

## Bước 2: Tạo file .env cho Backend

Tạo file `.env` trong thư mục `backend/` với nội dung:

```env
MONGODB_URI=mongodb://localhost:27017/student-accommodation
JWT_SECRET=your_super_secret_key_change_this_in_production_12345
PORT=5000
NODE_ENV=development
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
CLIENT_URL=http://localhost:5173
```

**Cách tạo file trên Windows CMD:**
```cmd
cd backend
echo MONGODB_URI=mongodb://localhost:27017/student-accommodation > .env
echo JWT_SECRET=your_super_secret_key_change_this_in_production_12345 >> .env
echo PORT=5000 >> .env
echo NODE_ENV=development >> .env
echo UPLOAD_PATH=./uploads >> .env
echo MAX_FILE_SIZE=10485760 >> .env
echo CLIENT_URL=http://localhost:5173 >> .env
```

**Hoặc dùng Notepad:**
1. Mở Notepad
2. Copy nội dung trên vào
3. Lưu với tên `.env` (chọn "All Files" trong Save dialog)
4. Đặt file trong thư mục `backend/`

## Bước 3: Tạo file .env cho Frontend

Tạo file `.env` trong thư mục `frontend/` với nội dung:

```env
VITE_API_URL=http://localhost:5000
```

**Cách tạo file trên Windows CMD:**
```cmd
cd frontend
echo VITE_API_URL=http://localhost:5000 > .env
```

## Bước 4: Đảm bảo MongoDB đang chạy

**Kiểm tra MongoDB trên Windows:**
```cmd
net start MongoDB
```

Nếu MongoDB chưa được cài đặt, tải từ: https://www.mongodb.com/try/download/community

## Bước 5: Chạy ứng dụng

Từ thư mục gốc của project, chạy:

```cmd
npm run dev
```

Lệnh này sẽ chạy cả backend và frontend cùng lúc.

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Xử lý lỗi thường gặp

### Lỗi: "Cannot find module" hoặc "Module not found"

**Giải pháp:**
```cmd
npm run install-all
```

### Lỗi: "JWT_SECRET is not defined" hoặc "Cannot read property"

**Giải pháp:** Đảm bảo đã tạo file `.env` trong thư mục `backend/` với `JWT_SECRET`

### Lỗi: "Cannot connect to MongoDB"

**Giải pháp:**
1. Kiểm tra MongoDB đã chạy:
   ```cmd
   net start MongoDB
   ```
2. Kiểm tra `MONGODB_URI` trong file `backend/.env`

### Lỗi: "Port 5000 already in use"

**Giải pháp:** Đổi port trong `backend/.env`:
```env
PORT=5001
```
Và cập nhật `frontend/.env`:
```env
VITE_API_URL=http://localhost:5001
```

### Lỗi PowerShell Execution Policy

Nếu gặp lỗi "running scripts is disabled", mở **Command Prompt (CMD)** thay vì PowerShell, hoặc chạy:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Chạy riêng từng phần (nếu cần)

**Terminal 1 - Backend:**
```cmd
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```cmd
cd frontend
npm run dev
```

