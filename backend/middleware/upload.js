const multer = require('multer');
const path = require('path');

// Check if Cloudinary is configured
let useCloudinary = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

let storage;

if (useCloudinary) {
  // Try to use Cloudinary
  try {
    const cloudinary = require('cloudinary').v2;
    //const { CloudinaryStorage } = require('multer-storage-cloudinary');
    const CloudinaryStorage = require('multer-storage-cloudinary');
    
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
  } catch (error) {
    console.warn('⚠️ Cloudinary configuration error:', error.message);
    if (error.message.includes('not installed')) {
      console.log('💡 To use Cloudinary, run: npm install cloudinary multer-storage-cloudinary');
    }
    console.log('📁 Falling back to local storage (uploads/)');
    useCloudinary = false;
  }
}

if (!useCloudinary) {
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

  console.log('📁 Using local storage (uploads/)');
  console.log('💡 To use Cloudinary:');
  console.log('   1. Run: npm install cloudinary multer-storage-cloudinary');
  console.log('   2. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
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
  // This is more flexible and handles edge cases
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








