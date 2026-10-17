// API Configuration

// API_ROOT is the concrete base path for all backend endpoints.
export const API_ROOT = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}` : '') + '';

// App Configuration
export const APP_CONFIG = {
  name: 'KaamSetu',
  version: '1.0.0',
  description: 'Connect with skilled workers for all your service needs',
  
  // Feature flags
  features: {
    geolocation: true,
    notifications: true,
    realTimeUpdates: true,
    fileUpload: true
  },
  
  // Limits
  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxImages: 5,
    maxDescriptionLength: 1000,
    otpExpiryMinutes: 10
  },
  
  // Default values
  defaults: {
    jobRadius: 10, // km
    currency: '₹',
    language: 'en',
    theme: 'light'
  }
}

// Environment check
export const isDevelopment = import.meta.env.DEV
export const isProduction = import.meta.env.PROD

// API endpoints
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    verifyOtp: '/auth/verify-otp',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password'
  },
  jobs: {
    create: '/jobs',
    list: '/jobs',
    details: '/jobs/:id',
    accept: '/jobs/:id/accept',
    cancel: '/jobs/:id/cancel',
    complete: '/jobs/:id/complete',
    rate: '/jobs/:id/rate'
  },
  workers: {
    profile: '/workers/profile',
    stats: '/workers/stats',
    jobs: '/workers/jobs'
  },
  clients: {
    profile: '/clients/profile',
    stats: '/clients/stats',
    jobs: '/clients/jobs'
  }
}