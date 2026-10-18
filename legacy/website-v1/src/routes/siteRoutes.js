import express from 'express';
import { renderHomepage,
         renderFAQ,
         renderPolicy,
         renderTerms,
         renderLogin,
         renderClientRegistration,
         renderLaborRegistration,
         handleLogin,
         logout
       } from '../controllers/siteController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { log } from 'console';

const router = express.Router();

// Route to render homepage
router.get('/', renderHomepage);

// Route to render FAQ
router.get('/faq', renderFAQ);

// Route to render Privacy Policy
router.get('/policy', renderPolicy);

// Route to render Terms and Conditions
router.get('/terms', renderTerms);

// Route to render Login page
router.get('/loginPage', authMiddleware, renderLogin);

// Route to render Client Registration
router.get('/client-registration', renderClientRegistration);

// Route to render Labor Registration
router.get('/labor-registration', renderLaborRegistration);

// Route to handle login
router.post('/login', handleLogin);

// Route to handle logout
router.get('/logout', logout);

export default router;
