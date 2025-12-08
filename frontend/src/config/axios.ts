import axios from 'axios';

// Configure axios base URL from environment variable
// In production, VITE_API_URL must be set to the backend URL
// In development, use Vite proxy (leave baseURL undefined) or explicit VITE_API_URL
const getApiUrl = () => {
  // Check if we're in production
  const isProduction = import.meta.env.PROD;
  
  // If VITE_API_URL is explicitly set, use it (works for both dev and prod)
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim();
    // Remove trailing slash if present
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  
  // In production, if VITE_API_URL is not set, this is an error
  if (isProduction) {
    console.error('⚠️ VITE_API_URL is not set in production!');
    console.error('⚠️ Please set VITE_API_URL environment variable to your backend URL');
    console.error('⚠️ Example: VITE_API_URL=https://your-backend.railway.app');
    // Return empty string to use relative URLs (will fail but at least won't crash)
    return '';
  }
  
  // In development, return undefined to use Vite proxy
  // This allows Vite's proxy (vite.config.ts) to handle the requests
  // If you want to use direct connection, set VITE_API_URL=http://localhost:5000
  return undefined;
};

const API_URL = getApiUrl();

// Log API URL for debugging (both dev and production)
console.log('🔧 Axios Configuration:');
console.log('  - Environment:', import.meta.env.PROD ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('  - VITE_API_URL:', import.meta.env.VITE_API_URL || 'NOT SET');
console.log('  - API Base URL:', API_URL || 'Using relative URLs (proxy)');

// Create axios instance with default config
// In production, baseURL MUST be set, otherwise requests will go to frontend domain
// In development, if baseURL is undefined, axios will use relative URLs and Vite proxy will handle it
const axiosInstance = axios.create({
  baseURL: API_URL || undefined, // undefined in dev = use Vite proxy, empty string in prod = error
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Warn if baseURL is not set in production
if (import.meta.env.PROD && !API_URL) {
  console.error('🚨 CRITICAL: API baseURL is not set in production!');
  console.error('🚨 All API requests will fail or go to wrong domain!');
  console.error('🚨 Please set VITE_API_URL environment variable on Vercel!');
}

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Handle 429 Too Many Requests - rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || error.response.headers['x-ratelimit-reset'];
      const rateLimitReset = error.response.headers['x-ratelimit-reset'];
      
      console.warn('⚠️ Rate Limit Exceeded:', {
        url: error.config?.url,
        retryAfter: retryAfter,
        rateLimitReset: rateLimitReset,
        message: 'Too many requests. Please wait before trying again.'
      });
      
      // Provide user-friendly error message with retry information
      const retryMessage = retryAfter 
        ? `Quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfter} giây.`
        : 'Quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.';
      
      error.userMessage = retryMessage;
      return Promise.reject(error);
    }
    
    // Handle 404 Not Found - provide helpful error message
    if (error.response?.status === 404) {
      const url = error.config?.url || 'unknown';
      console.error('❌ 404 Error:', {
        url: url,
        method: error.config?.method?.toUpperCase(),
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL ? `${error.config.baseURL}${url}` : url,
        message: 'API endpoint not found. Check if VITE_API_URL is set correctly in production.'
      });
      
      // If in production and baseURL is empty, suggest setting VITE_API_URL
      if (import.meta.env.PROD && !API_URL) {
        console.error('💡 Solution: Set VITE_API_URL environment variable to your backend URL');
      }
    }
    
    // Handle network errors (CORS, connection refused, etc.)
    if (!error.response) {
      const isDevelopment = import.meta.env.DEV;
      const errorMessage = error.message || 'Network Error';
      
      console.error('❌ Network Error:', {
        message: errorMessage,
        url: error.config?.url,
        baseURL: error.config?.baseURL || 'Using Vite proxy',
        fullURL: error.config?.baseURL 
          ? `${error.config.baseURL}${error.config.url}` 
          : error.config?.url,
        code: error.code,
        suggestion: isDevelopment 
          ? 'Check if backend server is running on http://localhost:5000'
          : 'Check if backend server is running and CORS is configured correctly'
      });
      
      // Provide user-friendly error message
      if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('Network Error')) {
        error.userMessage = isDevelopment
          ? 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy trên http://localhost:5000 không?'
          : 'Không thể kết nối đến server. Vui lòng thử lại sau.';
      } else if (errorMessage.includes('CORS')) {
        error.userMessage = 'Lỗi CORS. Vui lòng kiểm tra cấu hình backend.';
      } else {
        error.userMessage = 'Lỗi kết nối mạng. Vui lòng thử lại.';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

