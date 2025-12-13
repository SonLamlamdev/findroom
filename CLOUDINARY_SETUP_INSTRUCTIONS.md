# ☁️ Hướng dẫn Setup Cloudinary - Bước tiếp theo

## ✅ Đã hoàn thành

1. ✅ Code đã được cập nhật để hỗ trợ Cloudinary
2. ✅ Upload middleware hỗ trợ cả local và Cloudinary
3. ✅ Routes đã được cập nhật để dùng helper functions
4. ✅ Packages đang được cài đặt...

## 📝 Bước tiếp theo của bạn

### 1. Đợi packages cài đặt xong

Sau khi npm install hoàn thành, tiếp tục các bước sau:

### 2. Tạo tài khoản Cloudinary (2 phút)

1. Truy cập: https://cloudinary.com/users/register/free
2. Đăng ký tài khoản miễn phí (dùng email và password)
3. Sau khi đăng nhập, vào **Dashboard**
4. Copy 3 thông tin sau (bạn sẽ thấy ở dashboard):
   - **Cloud Name** (ví dụ: `dabc123`)
   - **API Key** (ví dụ: `123456789012345`)
   - **API Secret** (ví dụ: `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Thêm vào file `.env`

Mở file `backend/.env` và thêm 3 dòng sau:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Lưu ý quan trọng:**
- Thay `your_cloud_name_here`, `your_api_key_here`, `your_api_secret_here` bằng giá trị thực từ Cloudinary Dashboard
- KHÔNG có dấu cách hoặc quotes
- KHÔNG commit file `.env` lên git (đã có trong .gitignore)

### 4. Khởi động lại backend

```bash
cd backend
npm run dev
```

### 5. Kiểm tra console

Khi backend start, bạn sẽ thấy một trong hai message:

✅ **Nếu thành công:**
```
✅ Using Cloudinary for file storage
```

⚠️ **Nếu chưa cấu hình:**
```
⚠️ Cloudinary not configured, using local storage (uploads/)
💡 To use Cloudinary, set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env
```

### 6. Test upload

1. Upload một image qua frontend
2. Kiểm tra Cloudinary Dashboard → Media Library
3. Image URL sẽ có dạng: `https://res.cloudinary.com/your-cloud/image/upload/...`

## 🎯 Lợi ích

Sau khi setup xong:
- ✅ Images được lưu trên Cloudinary (không phụ thuộc server)
- ✅ Tự động optimize và compress
- ✅ CDN global → load nhanh hơn
- ✅ Không cần set `VITE_API_URL` cho images (vì đã là full URL)

## 🔍 Kiểm tra

Sau khi upload image thành công:
1. Vào Cloudinary Dashboard → Media Library
2. Tìm image vừa upload
3. Image URL bắt đầu bằng `https://res.cloudinary.com/...`
4. Images hiển thị trên frontend

## 🐛 Troubleshooting

### Lỗi: "Cannot find module 'cloudinary'"
```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

### Lỗi: "Invalid cloud_name"
- Kiểm tra `.env` có đúng format không
- Không có dấu cách hoặc quotes thừa
- Copy chính xác từ Cloudinary Dashboard

### Vẫn dùng local storage
- Kiểm tra console khi start server
- Nếu thấy warning, kiểm tra lại `.env`
- Đảm bảo restart server sau khi update `.env`

---

**Sau khi hoàn thành các bước trên, Cloudinary sẽ tự động được sử dụng!** 🎉
