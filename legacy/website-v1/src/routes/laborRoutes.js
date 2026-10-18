import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import {
  handleLaborRegistration,
  renderDashboard,
  renderAvailableJobs,
  renderPastJobs,
  renderPayments,
  renderProfile,
  applyForJob,
  cancelJobApplication,
  updateProfile,
  updatePassword,
  logoutLabor,
  deleteAccount
} from '../controllers/laborController.js';

const router = express.Router();

// Handle labor registration form submission
router.post('/registration', handleLaborRegistration);


// Middleware to ensure only laborers can access these routes
const laborRoleMiddleware = roleMiddleware(['labor']);

// GET /labor/dashboard/:laborId
router.get('/dashboard/:laborId', authMiddleware, laborRoleMiddleware, renderDashboard);

// GET /labor/available-jobs/:laborId
router.get('/available-jobs/:laborId', authMiddleware, laborRoleMiddleware, renderAvailableJobs);

// Apply for a job
router.post('/available-jobs/:laborId/apply', authMiddleware, applyForJob);

// Cancel a job application
router.post('/available-jobs/:laborId/cancel', authMiddleware, cancelJobApplication);

// GET /labor/past-jobs/:laborId
router.get('/past-jobs/:laborId', authMiddleware, laborRoleMiddleware, renderPastJobs);

// GET /labor/payment/:laborId
router.get('/payment/:laborId', authMiddleware, laborRoleMiddleware, renderPayments);

// GET /labor/profile/:laborId
router.get('/profile/:laborId', authMiddleware, laborRoleMiddleware, renderProfile);

// PUT /labor/profile/:laborId/update
router.put('/profile/:laborId/update', authMiddleware, laborRoleMiddleware, updateProfile);

// PUT /labor/profile/:laborId/update-password
router.put('/profile/:laborId/update-password', authMiddleware, laborRoleMiddleware, updatePassword);

// POST /labor/logout/:laborId
router.post('/logout/:laborId', authMiddleware, laborRoleMiddleware, logoutLabor);

// DELETE /labor/delete-account/:laborId
router.delete('/delete-account/:laborId', authMiddleware, laborRoleMiddleware, deleteAccount);

export default router;