# ☁️ Hướng dẫn Setup Cloudinary cho Image Upload

## 📋 Tổng quan

Cloudinary là dịch vụ cloud storage cho images và videos với free tier rộng rãi:
- **25GB storage** miễn phí
- **25GB bandwidth/tháng** miễn phí
- Tự động optimize và resize images
- CDN global để load nhanh

## 🚀 Bước 1: Tạo tài khoản Cloudinary

1. Truy cập: https://cloudinary.com/users/register/free
2. Đăng ký tài khoản miễn phí
3. Sau khi đăng nhập, vào **Dashboard**
4. Copy các thông tin sau:
   - **Cloud Name** (ví dụ: `dabc123`)
   - **API Key** (ví dụ: `123456789012345`)
   - **API Secret** (ví dụ: `abcdefghijklmnopqrstuvwxyz123456`)

## 📦 Bước 2: Cài đặt packages

```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

## 🔧 Bước 3: Cấu hình Backend

### 3.1. Thêm environment variables

Thêm vào file `.env` trong thư mục `backend/`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3.2. Cập nhật `backend/middleware/upload.js`

Thay thế nội dung file bằng code sau:

```javascript
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on file type or route
    let folder = 'findroom';
    
    // Check if this is an avatar upload (from user profile)
    if (req.route?.path?.includes('avatar') || file.fieldname === 'avatar') {
      folder = 'findroom/avatars';
    } else if (file.fieldname === 'images' || file.fieldname === 'media') {
      folder = 'findroom/listings';
    } else if (req.route?.path?.includes('blog')) {
      folder = 'findroom/blogs';
    }
    
    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv', 'm4v'],
      resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      transformation: [
        // Auto-optimize images
        { quality: 'auto', fetch_format: 'auto' }
      ]
    };
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file extensions
  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|bmp|svg|mp4|mov|avi|wmv|flv|webm|mkv|m4v)$/i;
  
  // Allowed MIME types
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/quicktime',  // mov
    'video/x-msvideo', // avi
    'video/x-ms-wmv',  // wmv
    'video/x-flv',     // flv
    'video/webm',      // webm
    'video/x-matroska', // mkv
    'video/x-m4v'      // m4v
  ];

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const hasValidExtension = allowedExtensions.test(fileExtension);
  const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);

  if (hasValidExtension || hasValidMimeType) {
    return cb(null, true);
  } else {
    const error = new Error(
      `File type not allowed. Only images and videos are allowed. ` +
      `Received: ${file.mimetype} (${fileExtension})`
    );
    console.error('❌ File upload rejected:', {
      filename: file.originalname,
      mimetype: file.mimetype,
      extension: fileExtension
    });
    return cb(error);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
```

**Lưu ý:** Thêm `const path = require('path');` ở đầu file nếu chưa có.

### 3.3. Cập nhật routes để trả về full URL

Cloudinary sẽ trả về object với property `path` hoặc `url`. Bạn cần cập nhật các routes:

#### `backend/routes/listings.js` - Create Listing

Tìm dòng:
```javascript
const filePath = `/uploads/${file.filename}`;
```

Thay bằng:
```javascript
const filePath = file.path || file.url; // Cloudinary returns full URL
```

#### `backend/routes/blogs.js` - Create Blog

Tìm dòng:
```javascript
images.push(`/uploads/${file.filename}`);
```

Thay bằng:
```javascript
images.push(file.path || file.url); // Cloudinary returns full URL
```

#### `backend/routes/users.js` - Upload Avatar

Nếu có upload avatar, cập nhật tương tự:
```javascript
const avatarUrl = req.file.path || req.file.url; // Cloudinary returns full URL
```

## ✅ Bước 4: Test

1. **Khởi động lại backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test upload:**
   - Upload một image qua frontend
   - Kiểm tra console để xem URL được trả về
   - URL sẽ có dạng: `https://res.cloudinary.com/your-cloud/image/upload/v123456/findroom/listings/...`

3. **Kiểm tra Cloudinary Dashboard:**
   - Vào https://cloudinary.com/console
   - Vào **Media Library**
   - Xem images đã được upload chưa

## 🔄 Migration từ Local Storage

Nếu bạn đã có images trong local storage:

1. **Tải images lên Cloudinary:**
   - Có thể dùng Cloudinary Upload API để migrate
   - Hoặc upload thủ công qua Dashboard

2. **Cập nhật database:**
   - Script để update các image paths từ `/uploads/...` sang Cloudinary URLs
   - Hoặc giữ cả hai và migrate dần

## 🎯 Lợi ích sau khi chuyển sang Cloudinary

1. ✅ Images load nhanh hơn nhờ CDN
2. ✅ Tự động optimize và compress
3. ✅ Không phụ thuộc vào server storage
4. ✅ Dễ scale khi có nhiều users
5. ✅ Frontend đã có helper functions, không cần thay đổi nhiều

## 📝 Notes

- Helper functions `getImageUrl()` trong frontend sẽ tự động nhận diện full URLs từ Cloudinary
- Không cần thay đổi frontend code
- Images cũ (nếu có) vẫn hoạt động nếu backend vẫn serve từ `/uploads`

## 🐛 Troubleshooting

### Lỗi: "Invalid cloud_name"
- Kiểm tra `CLOUDINARY_CLOUD_NAME` trong `.env`
- Đảm bảo không có dấu cách hoặc ký tự đặc biệt

### Lỗi: "Unauthorized"
- Kiểm tra `CLOUDINARY_API_KEY` và `CLOUDINARY_API_SECRET`
- Copy đúng từ Dashboard

### Images không hiển thị
- Kiểm tra URL trong database có đúng format Cloudinary không
- Kiểm tra Cloudinary Dashboard xem images có tồn tại không
- Kiểm tra CORS settings nếu cần

---

*Sau khi setup xong, images sẽ được lưu trên Cloudinary và tự động có CDN để load nhanh hơn!*
