import { create } from "zustand";
import { persist } from "zustand/middleware";
import authService from "../services/authService";
import { API_ROOT } from '@/config'

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isRefreshing: false,
  lastActivity: null,
  error: null,
};

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ 
        isAuthenticated,
        lastActivity: isAuthenticated ? Date.now() : null 
      }),
      setLoading: (isLoading) => set({ isLoading }),
      setRefreshing: (isRefreshing) => set({ isRefreshing }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      updateLastActivity: () => set({ lastActivity: Date.now() }),
      
      login: (userData) => {
        const user = {
          id: userData.id || userData._id,
          name: userData.name,
          email: userData.email?.email || userData.email,
          role: userData.role,
          profilePicture: userData.profilePicture,
          blocked: userData.blocked === true
        };
        
        set({
          user,
          isAuthenticated: true,
          lastActivity: Date.now(),
          error: null,
        });
      },
      
      logout: async () => {
        try {
          await authService.removeTokens();
        } finally {
          set(initialState);
        }
      },
      
      reset: () => set(initialState),
      
      // Check session validity
      checkSession: async () => {
        const { lastActivity } = get();
        
        // Check session timeout
        if (lastActivity && (Date.now() - lastActivity > SESSION_TIMEOUT)) {
          get().logout();
          return false;
        }
        
        // Check token validity
        return get().checkAuth();
      },
      
      // Check authentication status
      checkAuth: async () => {
        try {
          set({ isLoading: true });
          
          // First check if we have a valid session
          if (!authService.hasValidSession()) {
            // Try to refresh the token
            const refreshSuccess = await authService.refreshToken();
            if (!refreshSuccess) {
              set({ isAuthenticated: false, user: null });
              return false;
            }
          }
          
          // Verify with the server
          const response = await fetch(`${API_ROOT}/auth/verify`, {
              method: 'GET',
              credentials: 'include', // Important for cookies
              signal: AbortSignal.timeout(3000) // 3 second timeout
            });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              set({
                user: { ...data.user, blocked: data.user?.blocked === true },
                isAuthenticated: true,
                isLoading: false,
                error: null
              });
              return true;
            }
          }
          
          // If verification fails, clear auth state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
          return false;
        } catch (connectionError) {
          // Handle connection errors silently (backend not running)
          set({ isLoading: false });
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);