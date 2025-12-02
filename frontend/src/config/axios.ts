import axios from 'axios';

// Configure axios base URL from environment variable
// In production, VITE_API_URL must be set to the backend URL
// In development, use localhost or the proxy will handle it
const getApiUrl = () => {
  return '';
  /*// Check if we're in production
  const isProduction = import.meta.env.PROD;
  
  // If VITE_API_URL is explicitly set, use it
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
  
  // In development, default to localhost
  return 'http://localhost:5000';
};*/}


const API_URL = getApiUrl();

// Log API URL for debugging (both dev and production)
console.log('🔧 Axios Configuration:');
console.log('  - Environment:', import.meta.env.PROD ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('  - VITE_API_URL:', import.meta.env.VITE_API_URL || 'NOT SET');
console.log('  - API Base URL:', API_URL || 'Using relative URLs (proxy)');

// Create axios instance with default config
// In production, baseURL MUST be set, otherwise requests will go to frontend domain
const axiosInstance = axios.create({
  baseURL: API_URL, // Will be undefined if empty string, which causes relative URLs
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
      console.error('❌ Network Error:', {
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        suggestion: 'Check if backend server is running and CORS is configured correctly'
      });
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

