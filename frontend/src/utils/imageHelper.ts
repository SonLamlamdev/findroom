/**
 * Helper function to get full image URL
 * Robustly handles Cloudinary URLs, local paths, and Windows-style paths
 */

export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    return 'https://placehold.co/600x400?text=No+Image'; // Return a clean placeholder instead of empty string
  }

  // 1. Handle Cloudinary or external URLs (http/https)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // 2. Special check: If it looks like a Cloudinary ID but missing protocol (rare but possible)
  if (imagePath.includes('cloudinary.com')) {
    return `https://${imagePath}`;
  }

  // 3. Handle Local Files (Backwards compatibility or fallback storage)
  // Get backend URL from environment variable
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Normalize base URL (remove trailing slash)
  const baseUrl = backendUrl.trim().endsWith('/') 
    ? backendUrl.trim().slice(0, -1) 
    : backendUrl.trim();

  // Clean the image path
  let cleanPath = imagePath.trim();
  
  // Replace Windows backslashes with forward slashes
  cleanPath = cleanPath.replace(/\\/g, '/');

  // Ensure path starts with / if it doesn't already
  if (!cleanPath.startsWith('/')) {
    // If it's just a filename (e.g. "image.jpg"), assume it's in /uploads/
    if (!cleanPath.includes('/')) {
      cleanPath = `/uploads/${cleanPath}`;
    } else {
      cleanPath = `/${cleanPath}`;
    }
  }

  return `${baseUrl}${cleanPath}`;
};

/**
 * Helper function to get avatar URL with fallback
 */
export const getAvatarUrl = (avatarPath: string | undefined | null): string => {
  if (!avatarPath) {
    return 'https://ui-avatars.com/api/?name=User&background=random';
  }
  return getImageUrl(avatarPath);
};

/**
 * Helper function to get full image URL
 * Converts relative paths like "/uploads/image.jpg" to full URLs
 */
/*---
export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    return ''; // Return empty string if no image
  }

  // If already a full URL (starts with http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Get backend URL from environment variable
  const backendUrl = import.meta.env.VITE_API_URL;
  
  // If VITE_API_URL is set, use it
  if (backendUrl) {
    const baseUrl = backendUrl.trim().endsWith('/') 
      ? backendUrl.trim().slice(0, -1) 
      : backendUrl.trim();
    return `${baseUrl}${imagePath}`;
  }

  // In development, use relative path (Vite proxy will handle it)
  // In production, this should not happen if VITE_API_URL is set
  if (import.meta.env.DEV) {
    return imagePath; // Vite proxy will handle /uploads
  }

  // Fallback: return relative path (may not work in production)
  console.warn('⚠️ VITE_API_URL not set, using relative path for image:', imagePath);
  return imagePath;
};---*/

/**
 * Helper function to get avatar URL with fallback
 */
/*---
export const getAvatarUrl = (avatarPath: string | undefined | null): string => {
  if (!avatarPath) {
    // Return default avatar or placeholder
    return 'https://ui-avatars.com/api/?name=User&background=random';
  }
  return getImageUrl(avatarPath);
};
---*/
