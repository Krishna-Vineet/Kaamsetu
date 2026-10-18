import express from "express";
import { processLogin, processLaborRegistration, processClientRegistration, logout } from "../controllers/authController.js";

const router = express.Router();

// Process login
router.post("/login", processLogin);

// Process labor registration
router.post("/labor-register", processLaborRegistration);

// Process client registration
router.post("/client-register", processClientRegistration);

// Logout
router.get("/logout", logout);

export default router;
