import express from 'express';
import {
  register,
  verifyOTP,
  login,
  logout,
  refreshToken,
  verifyAuth,
  resendOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

// POST /auth/register
router.post('/register', register);

// POST /auth/verify-otp
router.post('/verify-otp', verifyOTP);

// POST /auth/login
router.post('/login', login);

// POST /auth/logout
router.post('/logout', logout);

// POST /auth/refresh-token
router.post('/refresh-token', refreshToken);

// GET /auth/verify
router.get('/verify', verifyAuth);

// POST /auth/resend-otp
router.post('/resend-otp', resendOtp);

// Password reset flow
// POST /auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /auth/verify-reset-otp
router.post('/verify-reset-otp', verifyResetOtp);

// POST /auth/reset-password
router.post('/reset-password', resetPassword);

export default router;
