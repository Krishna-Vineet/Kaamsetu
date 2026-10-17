// API service with token refresh interceptor
import authService from './authService';
import { useAuthStore } from '../store/auth.js';

// Track token refresh state
let isRefreshing = false;
let refreshPromise = null;

const apiService = {
  // Check if token needs refresh (10 minutes before expiration)
  shouldRefreshToken: () => {
    const authToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='));
      
    if (!authToken) return false;
    
    try {
      const token = authToken.split('=')[1];
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = (payload.exp * 1000 - Date.now()) / 1000 / 60; // in minutes
      return expiresIn < 10; // Refresh if less than 10 minutes remaining
    } catch (e) {
      return false;
    }
  },

  // Base fetch with authentication and refresh token handling
  fetch: async (url, options = {}) => {
    const headers = {
      ...options.headers,
    };

    // Only set Content-Type if body is not FormData
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    const config = {
      ...options,
      headers,
      credentials: 'include',
    };
    
    try {
      // Check if token needs refresh
      if (apiService.shouldRefreshToken() && !isRefreshing) {
        isRefreshing = true;
        refreshPromise = authService.refreshToken()
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }
      
      // Wait for refresh if it's in progress
      if (isRefreshing) {
        await refreshPromise;
      }
      
      let response = await fetch(url, config);
      
      // If unauthorized, try to refresh token but only if this is not a login request
      if (response.status === 401 && !url.endsWith('/auth/login')) {
        const refreshSuccess = await authService.refreshToken();
        
        // If token refresh was successful, retry the original request
        if (refreshSuccess) {
          response = await fetch(url, config);
        }

        // If still 401 after refresh attempt, logout and throw session expired error
        if (response.status === 401) {
          useAuthStore.getState().logout();
          throw new Error('Session expired. Please login again.');
        }
      }
      
      return response;
    } catch (error) {
      if (error.message !== 'Session expired. Please login again.') {
        console.error('API request failed:', error);
      }
      throw error;
    }
  },
  
  // GET request
  get: async (url, options = {}) => {
    return apiService.fetch(url, {
      ...options,
      method: 'GET',
    });
  },
  
  // POST request
  post: async (url, data, options = {}) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiService.fetch(url, {
      ...options,
      method: 'POST',
      body,
    });
  },
  
  // PUT request
  put: async (url, data, options = {}) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiService.fetch(url, {
      ...options,
      method: 'PUT',
      body,
    });
  },
  
  // DELETE request
  delete: async (url, options = {}) => {
    return apiService.fetch(url, {
      ...options,
      method: 'DELETE',
    });
  },
};

export default apiService;