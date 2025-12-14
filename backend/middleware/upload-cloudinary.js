/**
 * Upload middleware với Cloudinary support
 * Sử dụng file này để thay thế upload.js khi muốn dùng Cloudinary
 * 
 * Setup:
 * 1. npm install cloudinary multer-storage-cloudinary
 * 2. Thêm vào .env:
 *    CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    CLOUDINARY_API_KEY=your_api_key
 *    CLOUDINARY_API_SECRET=your_api_secret
 * 3. Rename file này thành upload.js hoặc update require() trong routes
 */

const multer = require('multer');
const path = require('path');

// Check if Cloudinary is configured
const useCloudinary = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

let storage;

if (useCloudinary) {
  // Use Cloudinary
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      // Determine folder based on file type or route
      let folder = 'findroom';
      
      // Check if this is an avatar upload (from user profile)
      if (file.fieldname === 'avatar') {
        folder = 'findroom/avatars';
      } else if (file.fieldname === 'images' || file.fieldname === 'media') {
        // Check route to determine if it's listing or blog
        if (req.route?.path?.includes('blog')) {
          folder = 'findroom/blogs';
        } else {
          folder = 'findroom/listings';
        }
      }
      
      return {
        folder: folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv', 'm4v'],
        resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
        transformation: [
          // Auto-optimize images
          { quality: 'auto', fetch_format: 'auto' }
        ]
      };
    }
  });

  console.log('✅ Using Cloudinary for file storage');
} else {
  // Use local storage (fallback)
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  console.log('⚠️ Cloudinary not configured, using local storage (uploads/)');
  console.log('💡 To use Cloudinary, set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
}

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

  // Get file extension (remove the dot)
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const hasValidExtension = allowedExtensions.test(fileExtension);
  const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);

  // Log for debugging (only in development)
  if (process.env.NODE_ENV !== 'production') {
    console.log('📁 File upload check:', {
      filename: file.originalname,
      mimetype: file.mimetype,
      extension: fileExtension,
      validExtension: hasValidExtension,
      validMimeType: hasValidMimeType
    });
  }

  // Allow if either extension OR mimetype is valid
  if (hasValidExtension || hasValidMimeType) {
    return cb(null, true);
  } else {
    const error = new Error(
      `File type not allowed. Only images (jpg, png, gif, webp, etc.) and videos (mp4, mov, avi, etc.) are allowed. ` +
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

/**
 * Helper function to get file URL/path from uploaded file
 * Works for both Cloudinary (returns full URL) and local storage (returns relative path)
 */
module.exports.getFileUrl = (file) => {
  if (!file) return null;
  
  // Cloudinary returns full URL in file.path or file.url
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
  }
  if (file.url && (file.url.startsWith('http://') || file.url.startsWith('https://'))) {
    return file.url;
  }
  
  // Local storage returns filename, need to prefix with /uploads/
  if (file.filename) {
    return `/uploads/${file.filename}`;
  }
  
  return null;
};
