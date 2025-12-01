# Hướng dẫn đăng nhập với tài khoản Admin

## Bước 1: Tạo tài khoản Admin

Có 2 cách để tạo tài khoản admin:

### Cách 1: Dùng script tự động (Khuyến nghị)

Mở **Command Prompt (CMD)** hoặc **PowerShell** và chạy:

```cmd
cd backend
node scripts/createAdminAccounts.js
```

Script sẽ tạo 3 tài khoản admin với thông tin sau:

**Admin 1:**
- Email: `admin1@findroom.com`
- Password: `Admin123!@#`

**Admin 2:**
- Email: `admin2@findroom.com`
- Password: `Admin123!@#`

**Admin 3:**
- Email: `admin3@findroom.com`
- Password: `Admin123!@#`

### Cách 2: Tạo thủ công qua MongoDB

1. Mở MongoDB Compass hoặc MongoDB shell
2. Kết nối đến database `student-accommodation`
3. Vào collection `users`
4. Tạo document mới với:
   ```json
   {
     "email": "admin@findroom.com",
     "password": "Admin123!@#",
     "name": "Admin",
     "role": "admin"
   }
   ```
   **Lưu ý:** Password sẽ được hash tự động khi save

## Bước 2: Đăng nhập

1. Mở trình duyệt và truy cập: http://localhost:5173/
2. Click vào nút **"Đăng nhập"** (hoặc truy cập http://localhost:5173/login)
3. Nhập thông tin:
   - **Email:** `admin1@findroom.com`
   - **Password:** `Admin123!@#`
4. Click **"Đăng nhập"**

## Bước 3: Truy cập Admin Panel

Sau khi đăng nhập thành công:

1. Bạn sẽ thấy menu **"Quản trị"** hoặc **"Admin"** trong thanh điều hướng
2. Click vào để truy cập Admin Panel
3. Hoặc truy cập trực tiếp: http://localhost:5173/admin

## Tính năng Admin Panel

Với tài khoản admin, bạn có thể:

- ✅ Xem thống kê tổng quan (người dùng, bài đăng, blog, v.v.)
- ✅ Quản lý người dùng (xem, cấm/bỏ cấm, xóa)
- ✅ Quản lý bài đăng (xem, xóa)
- ✅ Quản lý blog (xem, xóa)
- ✅ Quản lý chú thích bản đồ
- ✅ Quản lý báo cáo ngập lụt

## Lưu ý bảo mật

⚠️ **Quan trọng:** Đổi mật khẩu admin trong production!

Để đổi mật khẩu, bạn có thể:
1. Sử dụng tính năng "Quên mật khẩu" (nếu có)
2. Hoặc cập nhật trực tiếp trong MongoDB:
   ```javascript
   // Trong MongoDB shell hoặc Compass
   db.users.updateOne(
     { email: "admin1@findroom.com" },
     { $set: { password: "NewSecurePassword123!" } }
   )
   ```
   **Lưu ý:** Password sẽ được hash tự động bởi bcrypt khi đăng nhập lần sau.

## Xử lý sự cố

### Lỗi: "Cannot connect to MongoDB"
- Đảm bảo MongoDB đang chạy: `net start MongoDB`
- Kiểm tra `MONGODB_URI` trong `backend/.env`

### Lỗi: "Admin already exists"
- Tài khoản admin đã được tạo trước đó
- Bạn có thể đăng nhập ngay với thông tin đã có

### Không thấy menu Admin sau khi đăng nhập
- Kiểm tra role của user có phải "admin" không
- Refresh trang (F5)
- Xóa cache và đăng nhập lại

## Tạo thêm Admin mới

Nếu muốn tạo thêm admin account, chỉnh sửa file `backend/scripts/createAdminAccounts.js` và thêm vào mảng `adminAccounts`:

```javascript
{
  email: 'newadmin@findroom.com',
  password: 'NewPassword123!@#',
  name: 'New Admin',
  role: 'admin'
}
```

Sau đó chạy lại script.

