import apiService from '../services/apiService';
import authService from '../services/authService';

import { API_ROOT } from '@/config';
const API_URL = API_ROOT;

export const authApi = {
  // Register new user (client or worker)
  register: async (data) => {
    try {
      const response = await apiService.post(`${API_URL}/auth/register`, data);

      if (!response.ok) {
        const error = await response.json();
        // Prefer server-provided message for 4xx responses so specific errors (e.g. registration incomplete)
        // bubble up to the UI instead of being replaced by a generic client-side message.
        if (response.status >= 400 && response.status < 500 && error.message) {
          throw new Error(error.message);
        }

        let errorMessage = error.message || "Registration failed";
        // Fallback client-side mapping for less informative responses
        if (error.message?.includes('already exists')) {
          errorMessage = 'An account with this email or phone already exists.';
        } else if (error.message?.includes('validation')) {
          errorMessage = 'Please check your input and try again.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Verify OTP after registration
  verifyOtp: async (data) => {
    try {
      const response = await apiService.post(`${API_URL}/auth/verify-otp`, data);

      if (!response.ok) {
        const error = await response.json();
        let errorMessage = error.message || "OTP verification failed";
        
        // More specific error messages
        if (error.message?.includes('expired')) {
          errorMessage = 'This OTP has expired. Please request a new one.';
        } else if (error.message?.includes('invalid') || error.message?.includes('incorrect')) {
          errorMessage = 'The OTP you entered is incorrect. Please try again.';
        } else if (response.status === 404) {
          errorMessage = 'No OTP found. Please request a new one.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      // Tokens are now managed by the server via cookies
      return responseData;
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Login user
  login: async (data) => {
    try {
      // Use fetch directly instead of apiService to avoid token refresh interference
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        let errorMessage = responseData.message || 'Login failed. Please try again.';
        
        // More specific error messages
        if (response.status === 401) {
          if (responseData.message?.includes('credentials')) {
            errorMessage = 'Incorrect email or password. Please try again.';
          } else if (responseData.message?.includes('verification')) {
            errorMessage = 'Please verify your email before logging in.';
          } else {
            errorMessage = 'Authentication failed. Please log in again.';
          }
        } else if (response.status === 403) {
          errorMessage = 'Your account has been suspended. Please contact support.';
        } else if (response.status === 404) {
          errorMessage = 'No account found with these credentials.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }

      return responseData;
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await apiService.post(`${API_URL}/auth/logout`, {});
      
      if (!response.ok) {
        const error = await response.json();
        let errorMessage = error.message || 'Logout failed';
        
        if (response.status === 401) {
          errorMessage = 'Your session has already expired.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error during logout. Your session has been cleared locally.';
        }
        
        throw new Error(errorMessage);
      }
      
      // Clear any stored tokens or user data
      authService.removeTokens();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      authService.removeTokens(); // Ensure tokens are cleared even on error
      
      // Don't show error toast for network errors during logout
      if (error.name !== 'TypeError' && !error.message.includes('network')) {
        throw error;
      }
      return false;
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        let errorMessage = error.message || 'Session expired';
        
        if (response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (response.status >= 500) {
          errorMessage = 'Unable to restore your session. Please log in again.';
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // Convert network errors to a more user-friendly message
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      
      throw error;
    }
  },
};