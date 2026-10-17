// Authentication service for handling JWT tokens with cookies
import { API_ROOT } from '@/config';
const authService = {
  // Check if we have a valid session
  hasValidSession: async () => {
    try {
  const response = await fetch(`${API_ROOT}/auth/verify`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.status === 401) {
        // Try to refresh token if unauthorized
        return await authService.refreshToken();
      }
      
      return response.ok;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  },

  // Remove tokens (logout)
  removeTokens: async () => {
    try {
  await fetch(`${API_ROOT}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Check if user is authenticated (alias for hasValidSession for backward compatibility)
  isAuthenticated: async () => {
    return await authService.hasValidSession();
  },
  
  // Get current user info
  getCurrentUser: async () => {
    try {
  const response = await fetch(`${API_ROOT}/auth/verify`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      if (response.status === 401) {
        const refreshed = await authService.refreshToken();
        if (refreshed) {
          return authService.getCurrentUser();
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  // Refresh the access token using refresh token
  refreshToken: async () => {
    try {
  const response = await fetch(`${API_ROOT}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to refresh token');
      }

      return data.success;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Only remove tokens if it's not a network error
      if (error.name !== 'TypeError') {
        await authService.removeTokens();
      }
      return false;
    }
  },
};

export default authService;