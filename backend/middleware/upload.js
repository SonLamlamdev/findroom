const multer = require('multer');
const path = require('path');

// Check if Cloudinary is configured
let useCloudinary = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

// Handle invalid CLOUDINARY_URL before requiring Cloudinary
// Cloudinary SDK reads CLOUDINARY_URL on module load, so we need to handle it first
let cloudinaryUrlBackup = null;
if (process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_URL.startsWith('cloudinary://')) {
  console.warn('⚠️ CLOUDINARY_URL environment variable has invalid format.');
  console.warn('💡 Temporarily unsetting it to use individual credentials instead.');
  console.warn('💡 Please remove CLOUDINARY_URL from environment variables or set it correctly.');
  
  // Backup the invalid URL and unset it before requiring Cloudinary
  cloudinaryUrlBackup = process.env.CLOUDINARY_URL;
  // Try both methods to unset the variable
  try {
    delete process.env.CLOUDINARY_URL;
    // Also set to undefined as fallback
    if (process.env.CLOUDINARY_URL) {
      process.env.CLOUDINARY_URL = undefined;
    }
  } catch (e) {
    // If delete fails, try setting to empty string
    process.env.CLOUDINARY_URL = '';
  }
}

let storage;

if (useCloudinary) {
  // Try to use Cloudinary
  try {
    const cloudinary = require('cloudinary').v2;
    const multerStorageCloudinary = require('multer-storage-cloudinary');
    
    // CloudinaryStorage might be exported as named export or default
    const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage || multerStorageCloudinary.default || multerStorageCloudinary;
    
    // Verify it's a constructor/class
    if (typeof CloudinaryStorage !== 'function') {
      throw new Error('CloudinaryStorage is not a constructor. Package may need to be reinstalled.');
    }

    // Configure Cloudinary using individual credentials
    // This ensures we use the correct credentials even if CLOUDINARY_URL was invalid
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true // Use HTTPS
    });

    // Restore CLOUDINARY_URL if we backed it up (though it won't be used)
    if (cloudinaryUrlBackup) {
      process.env.CLOUDINARY_URL = cloudinaryUrlBackup;
    }

    // Use memory storage for parallel uploads
    storage = multer.memoryStorage();
    
    // Store Cloudinary instance for manual uploads
    module.exports.cloudinary = cloudinary;
    module.exports.useCloudinary = true;

    console.log('✅ Using Cloudinary for file storage (parallel uploads enabled)');
  } catch (error) {
    // Log full error details for debugging
    console.error('❌ Cloudinary configuration error:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    if (error.name) console.error('   Error Name:', error.name);
    if (error.code) console.error('   Error Code:', error.code);
    
    if (error.message.includes('not installed') || error.message.includes('Cannot find module')) {
      console.log('💡 To use Cloudinary, run: npm install cloudinary multer-storage-cloudinary');
      console.log('💡 Then restart the server');
    } else if (error.message.includes('CloudinaryStorage is not a constructor')) {
      console.log('💡 CloudinaryStorage import error. This may be due to:');
      console.log('   1. Package not installed correctly - try: npm install multer-storage-cloudinary');
      console.log('   2. Package version mismatch - try: npm install multer-storage-cloudinary@latest');
      console.log('   3. Clear node_modules and reinstall: rm -rf node_modules package-lock.json && npm install');
    } else if (error.message.includes('CLOUDINARY_URL') || error.message.includes('protocol')) {
      console.log('💡 CLOUDINARY_URL environment variable has invalid format.');
      console.log('💡 Please either:');
      console.log('   1. Remove CLOUDINARY_URL and use CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
      console.log('   2. Or set CLOUDINARY_URL in format: cloudinary://api_key:api_secret@cloud_name');
      console.log('💡 Make sure you have set: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
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
  module.exports.useCloudinary = false;
  module.exports.cloudinary = null;
}

// Helper function to upload files to Cloudinary in parallel
module.exports.uploadToCloudinary = async (files, folder = 'findroom') => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return [];
  }

  if (!module.exports.useCloudinary || !module.exports.cloudinary) {
    return files.map(file => ({
      ...file,
      path: file.filename ? `/uploads/${file.filename}` : null,
      url: file.filename ? `/uploads/${file.filename}` : null
    }));
  }

  const cloudinary = module.exports.cloudinary;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  // Validate file sizes and buffers before upload
  const validFiles = files.filter(file => {
    if (!file || !file.buffer) {
      console.warn('File missing buffer:', file?.originalname || 'unknown');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      console.warn(`File ${file.originalname || 'unknown'} exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
      return false;
    }
    return true;
  });
  
  if (validFiles.length === 0) {
    return [];
  }
  
  // Upload files in parallel
  const uploadPromises = validFiles.map(file => {
    const resourceType = (file.mimetype && file.mimetype.startsWith('video/')) ? 'video' : 'image';
    
    return new Promise((resolve, reject) => {
      try {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: resourceType,
            quality: 'auto:good',
            fetch_format: 'auto',
            timeout: 60000,
            chunk_size: 6000000
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else if (result && result.secure_url) {
              resolve({
                ...file,
                path: result.secure_url,
                url: result.secure_url,
                public_id: result.public_id
              });
            } else {
              reject(new Error('Cloudinary upload returned invalid result'));
            }
          }
        );
        
        if (file.buffer) {
          uploadStream.end(file.buffer);
        } else {
          reject(new Error('File buffer is missing'));
        }
      } catch (streamError) {
        console.error('Error creating upload stream:', streamError);
        reject(streamError);
      }
    });
  });

  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error during parallel uploads:', error);
    throw error;
  }
};

// File filter - reject BMP and validate file size
const fileFilter = (req, file, cb) => {
  // Allowed file extensions (BMP excluded)
  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|svg|mp4|mov|avi|wmv|flv|webm|mkv|m4v)$/i;
  
  // Allowed MIME types (BMP excluded)
  const allowedMimeTypes = [
    // Images (BMP excluded)
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
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

  // Get file extension
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isBMP = fileExtension === '.bmp' || file.mimetype === 'image/bmp';
  
  // Reject BMP explicitly
  if (isBMP) {
    const error = new Error('BMP format is not supported. Please use JPG, PNG, GIF, or WebP.');
    console.error('❌ BMP file rejected:', file.originalname);
    return cb(error);
  }

  const hasValidExtension = allowedExtensions.test(fileExtension);
  const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);

  if (hasValidExtension || hasValidMimeType) {
    return cb(null, true);
  } else {
    const error = new Error(
      `File type not allowed. Only images (jpg, png, gif, webp, svg) and videos (mp4, mov, avi, etc.) are allowed. ` +
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







