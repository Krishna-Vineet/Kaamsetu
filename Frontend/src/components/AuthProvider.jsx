import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { sessionManager } from '@/utils/sessionManager';

export default function AuthProvider({ children }) {
  const { checkAuth, checkSession, isLoading, isAuthenticated } = useAuthStore();

  // Initialize session manager when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      sessionManager.init();
    } else {
      sessionManager.destroy();
    }
    
    return () => {
      sessionManager.destroy();
    };
  }, [isAuthenticated]);

  // Check auth status on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth verification failed:', error);
      }
    };
    
    verifyAuth();
    
    // Set up periodic session check (every 5 minutes)
    const sessionCheckInterval = setInterval(() => {
      if (isAuthenticated) {
        checkSession();
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(sessionCheckInterval);
  }, [checkAuth, checkSession, isAuthenticated]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#445FA2]/10 to-[#009889]/10">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1F4D36] rounded-full animate-spin"></div>
          <p className="text-gray-700 font-medium text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}