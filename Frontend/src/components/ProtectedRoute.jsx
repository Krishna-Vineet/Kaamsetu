


import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/auth';

export function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();
  const toastShown = useRef(false);
  const roleErrorShown = useRef(false);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#445FA2]/10 to-[#009889]/10">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1F4D36] rounded-full animate-spin"></div>
          <p className="text-gray-700 font-medium text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show toast and redirect to login with return url
  if (!isAuthenticated || !user) {
    // Only show toast once per component instance
    if (!toastShown.current) {
      toastShown.current = true;
      toast.error('Please login to access this page', {
        description: 'You will be redirected to the login page.',
        duration: 3000,
      });
    }

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but blocked, redirect to blocked page
  if (user?.blocked) {
    return <Navigate to={'/blocked'} replace />;
  }

  // If authenticated but wrong role, show error toast and redirect
  if (requiredRole && user.role !== requiredRole) {
    if (!roleErrorShown.current) {
      roleErrorShown.current = true;
      toast.error('Access Denied', {
        description: `You don't have permission to access ${requiredRole} pages.`,
        duration: 4000,
      });
    }
    return <Navigate to={'/unauthorized'} replace />;
  }

  // If authenticated and has correct role, render the protected content
  return <>{children}</>;
}