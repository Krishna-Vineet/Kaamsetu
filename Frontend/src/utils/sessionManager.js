// Session management utilities
import { useAuthStore } from '@/store/auth';

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Activity events that should reset the session timer
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click'
];

class SessionManager {
  constructor() {
    this.activityTimeout = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    // Set up activity listeners
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, this.handleUserActivity, true);
    });

    // Set up visibility change handler
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    this.initialized = true;
  }

  destroy() {
    if (!this.initialized) return;
    
    // Clean up event listeners
    ACTIVITY_EVENTS.forEach(event => {
      window.removeEventListener(event, this.handleUserActivity, true);
    });
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
      this.activityTimeout = null;
    }
    
    this.initialized = false;
  }

  handleUserActivity = () => {
    const authStore = useAuthStore.getState();
    
    // Update last activity time
    authStore.updateLastActivity();
    
    // Reset the activity timeout
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
    }
    
    // Set new timeout for session expiration
    this.activityTimeout = setTimeout(() => {
      if (authStore.isAuthenticated) {
        authStore.logout();
        // Optionally redirect to login page
        window.location.href = '/login';
      }
    }, SESSION_TIMEOUT);
  };

  handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Check session when tab becomes active again
      const authStore = useAuthStore.getState();
      if (authStore.isAuthenticated) {
        authStore.checkSession();
      }
    }
  };
}

export const sessionManager = new SessionManager();

// Initialize session manager when the app loads
if (typeof window !== 'undefined') {
  sessionManager.init();
}
