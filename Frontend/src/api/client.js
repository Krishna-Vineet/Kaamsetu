import apiService from '../services/apiService';
import { API_ROOT } from '@/config';

const API_BASE_URL = API_ROOT;
const api = {
  // Get client profile
  getProfile: async () => {
    const response = await apiService.get(`${API_BASE_URL}/clients/profile`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profile');
    }
    
    return response.json();
  },

  // Update client profile
  updateProfile: async (profileData) => {
    const response = await apiService.put(`${API_BASE_URL}/clients/profile`, profileData);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    
    return response.json();
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await apiService.post(`${API_BASE_URL}/clients/profile-picture`, formData);
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to upload profile picture')
    }
    
    return response.json()
  },

  // Get client statistics
  getStats: async () => {
    const response = await apiService.get(`${API_BASE_URL}/clients/stats`);
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch statistics')
    }
    
    return response.json()
  },

  // Send OTP for email update
  sendUpdateEmailOtp: async (data) => {
    const response = await apiService.post(`${API_BASE_URL}/clients/send-email-otp`, data);
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send email OTP')
    }
    
    return response.json()
  },

  // Send OTP for phone update
  sendUpdatePhoneOtp: async (data) => {
    const response = await apiService.post(`${API_BASE_URL}/clients/send-phone-otp`, data);
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send phone OTP')
    }
    
    return response.json()
  },

  // Verify email OTP
  verifyEmailOtp: async (data) => {
    const response = await apiService.post(`${API_BASE_URL}/clients/verify-email-otp`, data);
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to verify email OTP')
    }
    
    return response.json()
  },

  // Verify phone OTP
  verifyPhoneOtp: async (data) => {
    const response = await apiService.post(`${API_BASE_URL}/clients/verify-phone-otp`, data);
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to verify phone OTP')
    }
    
    return response.json()
  },

  // Change password
  changePassword: async (data) => {
    const response = await apiService.post(`${API_BASE_URL}/clients/change-password`, data);
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to change password')
    }
    
    return response.json()
  },

  // Upload Aadhaar document
  uploadAadhaarDocument: async (formData) => {
    const response = await apiService.post(`${API_BASE_URL}/clients/aadhaar-verification`, formData);
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to upload Aadhaar document')
    }
    
    return response.json()
  }
}

export { api as clientApi }