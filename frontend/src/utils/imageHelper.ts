/**
 * Helper function to get full image URL
 * Converts relative paths like "/uploads/image.jpg" to full URLs
 */

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
};

/**
 * Helper function to get avatar URL with fallback
 */
export const getAvatarUrl = (avatarPath: string | undefined | null): string => {
  if (!avatarPath) {
    // Return default avatar or placeholder
    return 'https://ui-avatars.com/api/?name=User&background=random';
  }
  return getImageUrl(avatarPath);
};

