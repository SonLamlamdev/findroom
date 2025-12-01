/**
 * Helper function to extract error message from various error formats
 * Handles: {code, message}, {error}, string, Error object, etc.
 */
export const getErrorMessage = (error: any, defaultMessage: string = 'Có lỗi xảy ra'): string => {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object, get the message
  if (error instanceof Error) {
    return error.message || defaultMessage;
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

