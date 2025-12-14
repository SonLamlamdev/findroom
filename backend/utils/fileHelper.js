/**
 * Helper function to get file URL/path from uploaded file
 * Works for both Cloudinary (returns full URL) and local storage (returns relative path)
 * 
 * Usage in routes:
 * const { getFileUrl } = require('../utils/fileHelper');
 * const imagePath = getFileUrl(req.files[0]);
 */

/**
 * Get file URL from multer file object
 * @param {Object} file - File object from multer
 * @returns {String|null} - File URL or path, or null if file is invalid
 */
const getFileUrl = (file) => {
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

/**
 * Process array of files and return array of URLs
 * @param {Array} files - Array of file objects from multer
 * @returns {Array} - Array of file URLs/paths
 */
const getFileUrls = (files) => {
  if (!files || !Array.isArray(files)) return [];
  
  return files
    .map(file => getFileUrl(file))
    .filter(url => url !== null);
};

/**
 * Separate images and videos from files array
 * @param {Array} files - Array of file objects from multer
 * @returns {Object} - Object with images and videos arrays
 */
const separateMedia = (files) => {
  const images = [];
  const videos = [];
  
  if (!files || !Array.isArray(files)) {
    return { images, videos };
  }
  
  files.forEach(file => {
    if (!file) return;
    
    try {
      const url = getFileUrl(file);
      if (!url) return;
      
      if (file.mimetype && file.mimetype.startsWith('image')) {
        images.push(url);
      } else if (file.mimetype && file.mimetype.startsWith('video')) {
        videos.push(url);
      } else {
        // Try to determine from URL or filename
        if (url.includes('image') || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url)) {
          images.push(url);
        } else if (url.includes('video') || /\.(mp4|mov|avi|wmv|flv|webm|mkv|m4v)$/i.test(url)) {
          videos.push(url);
        }
      }
    } catch (error) {
      console.warn('Error processing file in separateMedia:', error);
    }
  });
  
  return { images, videos };
};

module.exports = {
  getFileUrl,
  getFileUrls,
  separateMedia
};
