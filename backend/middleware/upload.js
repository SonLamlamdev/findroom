const multer = require('multer');
const path = require('path');

// Check if Cloudinary is configured
let useCloudinary = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

// Handle invalid CLOUDINARY_URL
let cloudinaryUrlBackup = null;
if (process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_URL.startsWith('cloudinary://')) {
  cloudinaryUrlBackup = process.env.CLOUDINARY_URL;
  try {
    delete process.env.CLOUDINARY_URL;
    if (process.env.CLOUDINARY_URL) process.env.CLOUDINARY_URL = undefined;
  } catch (e) {
    process.env.CLOUDINARY_URL = '';
  }
}

let storage;
let cloudinaryInstance = null; // Store reference to cloudinary

if (useCloudinary) {
  try {
    const cloudinary = require('cloudinary').v2;
    const multerStorageCloudinary = require('multer-storage-cloudinary');
    const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage || multerStorageCloudinary.default || multerStorageCloudinary;
    
    if (typeof CloudinaryStorage !== 'function') throw new Error('CloudinaryStorage is not a constructor');

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    if (cloudinaryUrlBackup) process.env.CLOUDINARY_URL = cloudinaryUrlBackup;

    // Use memory storage so we can handle the upload manually in the route
    storage = multer.memoryStorage();
    cloudinaryInstance = cloudinary;
    
    console.log('✅ Using Cloudinary for file storage (parallel uploads enabled)');
  } catch (error) {
    console.error('❌ Cloudinary configuration error:', error.message);
    console.log('📁 Falling back to local storage (uploads/)');
    useCloudinary = false;
  }
}

if (!useCloudinary) {
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const fs = require('fs');
      const uploadDir = 'uploads/';
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  console.log('📁 Using local storage (uploads/)');
}

// File Filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|svg|mp4|mov|avi|wmv|flv|webm|mkv|m4v)$/i;
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-flv', 'video/webm', 'video/x-matroska', 'video/x-m4v'];

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isBMP = fileExtension === '.bmp' || file.mimetype === 'image/bmp';
  
  if (isBMP) return cb(new Error('BMP format is not supported.'));

  if (allowedExtensions.test(fileExtension) || allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  } else {
    return cb(new Error('File type not allowed.'));
  }
};

// Initialize Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});

// --- ATTACH HELPERS DIRECTLY TO THE UPLOAD OBJECT ---

// Attach Cloudinary instance check
upload.useCloudinary = useCloudinary;
upload.cloudinary = cloudinaryInstance;

// Attach the uploadToCloudinary function
upload.uploadToCloudinary = async (files, folder = 'findroom') => {
  if (!files || !Array.isArray(files) || files.length === 0) return [];

  // If NOT using Cloudinary, just return the local paths that Multer already created
  if (!upload.useCloudinary || !upload.cloudinary) {
    return files.map(file => ({
      ...file,
      path: file.filename ? `/uploads/${file.filename}` : null,
      url: file.filename ? `/uploads/${file.filename}` : null
    }));
  }

  // If using Cloudinary, perform the upload from buffer
  const cloudinary = upload.cloudinary;
  const uploadPromises = files.map(file => {
    return new Promise((resolve, reject) => {
      const resourceType = (file.mimetype && file.mimetype.startsWith('video/')) ? 'video' : 'image';
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: resourceType,
          quality: 'auto:good',
          fetch_format: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve({
            ...file,
            path: result.secure_url,
            url: result.secure_url,
            public_id: result.public_id
          });
        }
      );
      
      if (file.buffer) uploadStream.end(file.buffer);
      else reject(new Error('File buffer missing (Multer configuration error)'));
    });
  });

  return await Promise.all(uploadPromises);
};

// Finally, export the upload object which now contains the helper function
module.exports = upload;