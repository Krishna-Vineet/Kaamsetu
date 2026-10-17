import apiService from '../services/apiService';
import { API_ROOT } from '@/config';

const API_URL = API_ROOT;

export const jobsApi = {
  // CLIENT APIS
  
  // Create a new job (client only)
  createJob: async (jobData) => {
    const response = await apiService.post(`${API_URL}/jobs/create`, jobData);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create job");
    }

    return response.json();
  },

  // Get client's jobs with pagination and filtering
  getClientJobs: async (params = {}) => {
    const { page = 1, limit = 10, status = 'all' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status
    });

    const response = await apiService.get(`${API_URL}/jobs/client?${queryParams}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch client jobs");
    }

    return response.json();
  },

  // Cancel a job (client only)
  cancelJob: async (jobId) => {
    const response = await apiService.put(`${API_URL}/jobs/${jobId}/cancel`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to cancel job");
    }

    return response.json();
  },

  // Start a job (client only) - generates completion OTP
  startJob: async (jobId) => {
    const response = await apiService.put(`${API_URL}/jobs/${jobId}/start`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to start job");
    }

    return response.json();
  },

  // Complete a job using OTP (client only)
  completeJob: async (jobId, otp) => {
    const response = await apiService.post(`${API_URL}/jobs/${jobId}/complete`, { otp });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to complete job");
    }

    return response.json();
  },

  // Rate worker after job completion (client only)
  rateWorker: async (jobId, rating, review = '') => {
    const response = await apiService.post(`${API_URL}/jobs/${jobId}/rate-worker`, { rating, review });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to rate worker");
    }

    return response.json();
  },

  // WORKER APIS

  // Get available jobs for workers with filtering
  getAvailableJobs: async (params = {}) => {
    const { page = 1, limit = 50, skill, maxDistance = 25, urgency, sortBy = 'distance' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy
    });

    if (skill) queryParams.append('skill', skill);
    if (maxDistance) queryParams.append('maxDistance', maxDistance.toString());
    if (urgency !== undefined) queryParams.append('urgency', urgency.toString());

    const response = await apiService.get(`${API_URL}/jobs/available?${queryParams}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch available jobs");
    }

    return response.json();
  },

  // Accept a job (worker only)
  acceptJob: async (jobId) => {
    const response = await apiService.post(`${API_URL}/jobs/${jobId}/accept`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to accept job");
    }

    return response.json();
  },

  // Get worker's assigned/active/completed jobs
  getWorkerJobs: async (params = {}) => {
    const { page = 1, limit = 10, status = 'all' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status
    });

    const response = await apiService.get(`${API_URL}/jobs/worker?${queryParams}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch worker jobs");
    }

    return response.json();
  },

  // Get completion OTP for active job (worker only)
  getCompletionOTP: async (jobId) => {
    const response = await apiService.get(`${API_URL}/jobs/${jobId}/generate-otp`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get completion OTP");
    }

    return response.json();
  },

  // Cancel accepted job (worker only)
  cancelJobByWorker: async (jobId) => {
    const response = await apiService.put(`${API_URL}/jobs/${jobId}/cancel-worker`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to cancel job");
    }

    return response.json();
  },

  // Rate client after job completion (worker only)
  rateClient: async (jobId, rating, review = '') => {
    const response = await apiService.post(`${API_URL}/jobs/${jobId}/rate-client`, { rating, review });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to rate client");
    }

    return response.json();
  },
};