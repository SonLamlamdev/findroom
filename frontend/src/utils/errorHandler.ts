/**
 * Helper function to extract error message from various error formats
 * Handles: {code, message}, {error}, string, Error object, etc.
 */
export const getErrorMessage = (error: any, defaultMessage: string = 'Có lỗi xảy ra'): string => {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // Handle network errors (no response from server)
  if (error?.code === 'ECONNREFUSED' || error?.code === 'ERR_NETWORK' || !error?.response) {
    const isDevelopment = import.meta.env.DEV;
    if (error?.userMessage) {
      return error.userMessage;
    }
    if (error?.message?.includes('Network Error') || error?.message?.includes('ECONNREFUSED')) {
      return isDevelopment
        ? 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy trên http://localhost:5000 không?'
        : 'Không thể kết nối đến server. Vui lòng thử lại sau.';
    }
    if (error?.message?.includes('CORS')) {
      return 'Lỗi CORS. Vui lòng kiểm tra cấu hình backend.';
    }
    return isDevelopment
      ? 'Lỗi kết nối mạng. Kiểm tra backend server có đang chạy không?'
      : 'Lỗi kết nối mạng. Vui lòng thử lại sau.';
  }

  // If it's an Error object, get the message
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  // Handle 429 Too Many Requests
  if (error?.response?.status === 429) {
    if (error?.userMessage) {
      return error.userMessage;
    }
    const retryAfter = error?.response?.headers?.['retry-after'] || error?.response?.headers?.['x-ratelimit-reset'];
    if (retryAfter) {
      return `Quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfter} giây.`;
    }
    return 'Quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.';
  }

  // Handle axios error response
  if (error?.response?.data) {
    const data = error.response.data;
    
    // Handle {code, message} format
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }
    
    // Handle {error} format
    if (data.error) {
      if (typeof data.error === 'string') {
        return data.error;
      }
      // If error is an object, try to get message from it
      if (data.error.message && typeof data.error.message === 'string') {
        return data.error.message;
      }
    }
    
    // Handle {errors} array format
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const firstError = data.errors[0];
      if (typeof firstError === 'string') {
        return firstError;
      }
      if (firstError?.msg && typeof firstError.msg === 'string') {
        return firstError.msg;
      }
    }
  }

  // Handle direct object with message property
  if (error?.message && typeof error.message === 'string') {
    return error.message;
  }

  // Fallback: try to stringify if it's an object
  if (typeof error === 'object' && error !== null) {
    try {
      const stringified = JSON.stringify(error);
      // If it's a short object, return it, otherwise return default
      if (stringified.length < 200) {
        return stringified;
      }
    } catch {
      // Ignore JSON.stringify errors
    }
  }

  return defaultMessage;
};

