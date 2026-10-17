import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { handleClientRegistration,
    renderProfile,
    renderPastJobs,
    renderDashboard,
    renderPayments,
    renderManageJobPage,
    handleJobPost,
    renderJobPostPage,
    getJobApplicants,
    approveLaborers,
    cancelJob,
    getClientJobs,
    getJobDetails,
    addJobUpdate
 } from '../controllers/clientController.js';
 
import { jobMediaUpload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// POST /client/registration
router.post('/registration', handleClientRegistration);

router.get('/profile/:clientId', authMiddleware, renderProfile);

router.get('/past-jobs/:clientId', authMiddleware, renderPastJobs);

router.get('/dashboard/:clientId', authMiddleware, renderDashboard);

router.get('/payments/:clientId', authMiddleware, renderPayments);


router.get('/manage-job/:clientId', authMiddleware, renderManageJobPage);

// Fetch all active jobs for a client
router.get("/:clientId/jobs", authMiddleware, roleMiddleware("client"), getClientJobs);

// Fetch details of a specific job
router.get("/:clientId/jobs/:jobId", authMiddleware, roleMiddleware(["client"]), getJobDetails);

// Add an update to a job
router.post("/:clientId/jobs/:jobId/update", authMiddleware, roleMiddleware("client"), addJobUpdate);


router.get("/job-applicants/:jobId", authMiddleware, roleMiddleware(["client"]), getJobApplicants);

// Route to approve laborers and start the job
router.post("/approve-laborers/:jobId", authMiddleware, roleMiddleware(["client"]), approveLaborers);

// Cancel a job (only client can do this)
router.post("/cancel-job/:jobId", authMiddleware, roleMiddleware(["client"]), cancelJob);

router.get('/post-job/:clientId', authMiddleware, renderJobPostPage);

router.post('/post-job/:clientId', authMiddleware, jobMediaUpload, handleJobPost);


export default router;
