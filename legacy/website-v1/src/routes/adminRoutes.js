import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  renderDashboard,
  renderJobManagement,
  renderUserManagement,
  renderPaymentManagement,
  renderDisputeManagement,
} from '../controllers/adminController.js';

const router = express.Router();

// Admin dashboard
router.get('/dashboard/:adminId', authMiddleware, renderDashboard);

// Job management page
router.get('/jobs/:adminId', authMiddleware, renderJobManagement);

// User management page
router.get('/users/:adminId', authMiddleware, renderUserManagement);

// Payment management page
router.get('/payments/:adminId', authMiddleware, renderPaymentManagement);

// Dispute management page
router.get('/disputes/:adminId', authMiddleware, renderDisputeManagement);

export default router;
