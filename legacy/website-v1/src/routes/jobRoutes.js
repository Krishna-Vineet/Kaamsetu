import express from 'express';
import { jobMediaUpload } from '../middleware/fileUpload.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { handlePostJob } from '../controllers/jobController.js';

const router = express.Router();

router.post('/post-job/:clientId', authMiddleware, jobMediaUpload, handlePostJob);

export default router;