import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.trim().replace(/\/$/, '')
  : 'https://student-accommodation-backend.onrender.com';

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || error.response.headers['x-ratelimit-reset'];
      console.warn('⚠️ Rate Limit Exceeded:', {
        url: error.config?.url,
        retryAfter: retryAfter
      });
      const retryMessage = retryAfter 
        ? `Quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfter} giây.`
        : 'Quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.';
      error.userMessage = retryMessage;
      return Promise.reject(error);
    }
    
    if (error.response?.status === 404) {
      const fullURL = error.config?.baseURL 
        ? `${error.config.baseURL}${error.config.url}` 
        : error.config?.url;
      console.error('❌ 404 Error:', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        fullURL: fullURL
      });
    }
    
    if (!error.response) {
      const fullURL = error.config?.baseURL && error.config?.url
        ? `${error.config.baseURL}${error.config.url}`
        : error.config?.url || 'unknown';
      
      console.error('❌ Network Error:', {
        code: error.code,
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: fullURL,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        error.userMessage = 'Không thể kết nối đến server. Vui lòng thử lại sau.';
      } else if (error.code === 'ERR_CORS' || error.message?.includes('CORS')) {
        error.userMessage = 'Lỗi CORS. Vui lòng kiểm tra cấu hình backend.';
      } else if (error.code === 'ECONNABORTED') {
        error.userMessage = 'Request timeout. Vui lòng thử lại.';
      } else {
        error.userMessage = 'Lỗi kết nối mạng. Vui lòng thử lại.';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

