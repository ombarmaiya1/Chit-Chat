import axios from 'axios';

// Base API URL from environment variable or empty string to utilize Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Configured Axios instance with cookie credentials and response interceptor
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for JWT httpOnly cookie transmission
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for data unwrapping and consistent error handling
api.interceptors.response.use(
  (response) => {
    // Unwraps data payload directly for callers
    return response.data;
  },
  (error) => {
    // Extract descriptive server message or fallback to standard error string
    const message =
      error.response?.data?.message ||
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.message ||
      'An unexpected error occurred';

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    customError.isAxiosError = true;

    return Promise.reject(customError);
  }
);

export default api;
