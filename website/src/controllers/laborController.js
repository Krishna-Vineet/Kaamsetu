import bcrypt from "bcrypt";
import { Log } from "../models/Log.js";
import { User } from "../models/User.js";
import { Job } from "../models/Job.js";
import { Payment } from "../models/Payment.js";
import { Rating } from "../models/Rating.js";
import { generateToken } from "../utils/jwtUtils.js";
import { timeAgo, getCleanDate } from "../utils/timeUtils.js";
import mongoose from "mongoose";

// Handle labor registration form submission
export const handleLaborRegistration = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      skills,
      address,
      pincode,
      upiId,
    } = req.body;

    // Validate input
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !skills.length ||
      !address ||
      !pincode ||
      !upiId
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if the email is already registered

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    // Ensure at least one skill is provided
    if (skills.length === 0) {
      return res.status(400).json({ error: "At least one skill is required." });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Email or phone is already registered." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new labor user
    const labor = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "labor",
      skills,
      address,
      pin: pincode,
      upiId,
    });

    // Create log
    await Log.create({
      title: "New Labor Registration",
      description: `New labor ${name} with email ${email} has successfully registered.`,
      link: `/labor/dashboard/${labor._id}`,
    });

    // Generate a token
    const token = generateToken({ id: labor._id, role: labor.role });

    // Redirect to the labor dashboard with labor ID as parameter
    res
      .status(201)
      .cookie("authToken", token, {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "strict", // Prevent CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      })
      .json({ message: "Labor registered successfully!", laborId: labor._id });
  } catch (error) {
    console.error("Error during labor registration:", error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
};

// Render Labor Dashboard
export const renderDashboard = async (req, res) => {
  try {
    const { laborId } = req.params;

    // Authorization check
    if (req.user.role !== "labor" || req.user.id !== laborId) {
      return res
        .status(403)
        .sendFile("src/public/html/unauthorised.html", { root: "." });
    }

    // Fetch total jobs and earnings
    const totalJobs = await Job.countDocuments({ laborers: laborId });
    const totalEarnings = await Payment.aggregate([
      {
        $match: {
          laborer: new mongoose.Types.ObjectId(laborId),
          status: "completed",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Fetch applied jobs
    const appliedJobs = await Job.find(
      { applied: laborId, status: { $in: ["posted", "accepted"] } },
      "title client createdAt status"
    )
      .populate("client", "name")
      .lean();

    // Fetch active jobs
    const activeJobs = await Job.find(
      { laborers: laborId, status: "active" },
      "title client startDate endDate"
    )
      .populate("client", "name")
      .lean();

    // Format data for EJS template
    const formattedData = {
      laborId,
      totalJobs,
      activeJobsCount: activeJobs.length,
      totalEarnings: (totalEarnings[0]?.total || 0).toLocaleString("en-IN"),
      appliedJobs: appliedJobs.map((job) => ({
        title: job.title,
        client: job.client.name,
        date: getCleanDate(job.createdAt),
        status: job.status === "posted" ? "Pending" : "Accepted",
      })),
      activeJobs: activeJobs.map((job) => ({
        title: job.title,
        client: job.client.name,
        startDate: getCleanDate(job.startDate),
        expectedCompletion: getCleanDate(job.endDate),
        status: "Active",
      })),
    };

    // Render the EJS template with the formatted data
    res.render("labor-dashboard", formattedData);
  } catch (error) {
    console.error("Error rendering labor dashboard:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Render Available Jobs
export const renderAvailableJobs = async (req, res) => {
  try {
    const { laborId } = req.params;

    // Authorization check
    if (req.user.role !== "labor" || req.user.id !== laborId) {
      return res
        .status(403)
        .sendFile("src/public/html/unauthorised.html", { root: "." });
    }

    // Fetch available jobs (all jobs awaiting selection)
    const jobs = await Job.find({
      status: "posted",
    })
      .select(
        "_id title description location budget subCategory createdAt client skills applied"
      )
      .populate("client", "name") // Populate client name
      .lean();

    // Format jobs data for EJS template
    const formattedData = {
      laborId,
      jobs: jobs.map((job) => ({
        // Using job._id as the unique identifier for the job
        _id: job._id.toString(),
        title: job.title,
        description: job.description,
        location: job.location,
        // Keep budget as a number so that we can format it in the template as desired
        budget: job.budget,
        laborRequired: job.subCategory, // Category of labor required
        postedDate: getCleanDate(job.createdAt), // Format posted date
        client: job.client.name, // Client name
        skillsRequired: job.skills || [], // Skills required for the job
        // Set isApplied to true if laborId is in job.applied array
        isApplied: job.applied.map((id) => id.toString()).includes(laborId),
      })),
    };

    // Render the EJS template with the formatted data
    res.render("labor-available-jobs", formattedData);
  } catch (error) {
    console.error("Error rendering available jobs:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Apply for a Job
// Apply for job (existing)
export const applyForJob = async (req, res) => {
  try {
    const { laborId } = req.params;
    const { jobId } = req.body;

    // Authorization check
    if (req.user.role !== "labor" || req.user.id !== laborId) {
      return res
        .status(403)
        .json({ error: "Unauthorized" })
        .sendFile("src/public/html/unauthorised.html", { root: "." });
    }

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    // Check if laborer has already applied
    if (job.applied.includes(laborId)) {
      return res
        .status(400)
        .json({ error: "You have already applied for this job" });
    }

    // Add laborer to the applied list
    job.applied.push(laborId);
    await job.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Job application submitted successfully",
      });
  } catch (error) {
    console.error("Error applying for job:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Cancel job application (new)
export const cancelJobApplication = async (req, res) => {
  try {
    const { laborId } = req.params;
    const { jobId } = req.body;

    // Authorization check
    if (req.user.role !== "labor" || req.user.id !== laborId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    // Check if the laborer has applied for the job
    if (!job.applied.map(String).includes(laborId)) {
      return res
        .status(400)
        .json({ error: "You have not applied for this job" });
    }

    // Remove the laborer from the applied list
    job.applied = job.applied.filter((id) => id.toString() !== laborId);
    await job.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Job application cancelled successfully",
      });
  } catch (error) {
    console.error("Error cancelling job application:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Render Past Jobs
export const renderPastJobs = async (req, res) => {
  try {
    const { laborId } = req.params;

    // Authorization check
    if (req.user.role !== "labor" || req.user.id !== laborId) {
      return res
        .status(403)
        .sendFile("src/public/html/unauthorised.html", { root: "." });
    }

    // Fetch completed and cancelled jobs
    const jobs = await Job.find({
      laborers: laborId,
      status: { $in: ["completed", "cancelled"] },
    })
      .populate("client", "name")
      .lean();

    // Format data for EJS template
    const formattedData = {
      laborId,
      completedJobs: jobs
        .filter((job) => job.status === "completed")
        .map((job) => ({
          title: job.title,
          client: job.client.name,
          location: job.location,
          completedDate: getCleanDate(job.endDate),
          earnings: job.cost?.toLocaleString("en-IN") || "N/A",
          status: "Completed",
        })),
      cancelledJobs: jobs
        .filter((job) => job.status === "cancelled")
        .map((job) => ({
          title: job.title,
          client: job.client.name,
          cancellationDate: getCleanDate(job.updatedAt),
          reason: job.cancelationReason || "Not specified",
          status: "Cancelled",
        })),
    };

    // Render the EJS template with the formatted data
    res.render("labor-past-jobs", formattedData);
  } catch (error) {
    console.error("Error rendering past jobs:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Render Payments
export const renderPayments = async (req, res) => {
  try {
    const { laborId } = req.params;

    // Authorization check
    if (req.user.role !== "labor" || req.user.id !== laborId) {
      return res
        .status(403)
        .sendFile("src/public/html/unauthorised.html", { root: "." });
    }

    // Fetch payment data
    const payments = await Payment.find({ laborer: laborId })
      .populate("job", "title")
      .lean();

    // Aggregate total earnings and pending payments
    const totalEarnings = payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingPayments = payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);

    // Calculate this month's earnings
    const currentMonth = new Date().getMonth() + 1; // Current month (1-12)
    const thisMonthEarnings = payments
      .filter((p) => {
        const paymentDate = new Date(p.doneDate);
        return (
          p.status === "completed" &&
          paymentDate.getMonth() + 1 === currentMonth
        );
      })
      .reduce((sum, p) => sum + p.amount, 0);

    // Format payments data for EJS template
    const formattedData = {
      laborId,
      totalEarnings: totalEarnings.toLocaleString("en-IN"),
      pendingPayments: pendingPayments.toLocaleString("en-IN"),
      thisMonthEarnings: thisMonthEarnings.toLocaleString("en-IN"),
      payments: payments.map((payment) => ({
        date: getCleanDate(payment.createdAt),
        jobId: `#JOB${payment.job?._id.toString().slice(-4)}`, // Format job ID
        description: payment.job?.title || "Deleted Job",
        amount: payment.amount.toLocaleString("en-IN"),
        status:
          payment.status.charAt(0).toUpperCase() + payment.status.slice(1), // Capitalize status
      })),
    };

    // Render the EJS template with the formatted data
    res.render("labor-payment", formattedData);
  } catch (error) {
    console.error("Error rendering payments:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Render Profile
export const renderProfile = async (req, res) => {
  try {
    const { laborId } = req.params;

    // Authorization check
    if (req.user.role !== "labor" || req.user.id !== laborId) {
      return res
        .status(403)
        .sendFile("src/public/html/unauthorised.html", { root: "." });
    }

    // Fetch laborer data
    const laborer = await User.findById(laborId)
      .select("name email phone address profilePic skills upiId")
      .lean();

    // Fetch performance metrics
    const totalJobs = await Job.countDocuments({ laborers: laborId });
    const completedJobs = await Job.countDocuments({
      laborers: laborId,
      status: "completed",
    });
    const jobCompletionRate =
      totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

    const totalEarnings = await Payment.aggregate([
      {
        $match: {
          laborer: new mongoose.Types.ObjectId(laborId),
          status: "completed",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const averageRating = await Rating.aggregate([
      { $match: { laborer: new mongoose.Types.ObjectId(laborId) } },
      { $group: { _id: null, avgRating: { $avg: "$score" } } },
    ]);

    // Fetch reviews
    const reviews = await Rating.find({ laborer: laborId })
      .populate("client", "name")
      .populate("job", "title")
      .lean();

    // Format data for EJS template
    const formattedData = {
      laborId,
      profile: {
        photo: laborer.profilePic || "",
        name: laborer.name,
        email: laborer.email,
        phone: laborer.phone,
        location: laborer.address || "Not specified",
        upiId: laborer.upiId || "N/A",
        skills: laborer.skills || [],
      },
      performance: {
        totalJobs,
        jobCompletionRate,
        averageRating: (averageRating[0]?.avgRating || 0).toFixed(1),
        totalEarnings: (totalEarnings[0]?.total || 0).toLocaleString("en-IN"),
      },
      reviews: reviews.map((review) => ({
        comment: review.review || "No comment provided",
        rating: review.score,
        clientName: review.client?.name || "Unknown Client",
        jobTitle: review.job?.title || "Deleted Job",
      })),
    };

    // Render the EJS template with the formatted data
    res.render("labor-profile", formattedData);
  } catch (error) {
    console.error("Error rendering labor profile:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { laborId } = req.params;
    const { name, phone, skills, upiId } = req.body;

    // Update laborer details
    const laborer = await User.findByIdAndUpdate(
      laborId,
      { name, phone, skills: skills.split(","), upiId },
      { new: true }
    );

    res
      .status(200)
      .json({
        success: true,
        message: "Profile updated successfully",
        laborer,
      });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update Password
export const updatePassword = async (req, res) => {
  try {
    const { laborId } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Find laborer
    const laborer = await User.findById(laborId);
    if (!laborer) return res.status(404).json({ error: "User not found" });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, laborer.password);
    if (!isMatch)
      return res.status(400).json({ error: "Current password is incorrect" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    laborer.password = hashedPassword;
    await laborer.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Logout Labor
export const logoutLabor = async (req, res) => {
  try {
    res.clearCookie("authToken"); // Clear the authentication token
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete Account
export const deleteAccount = async (req, res) => {
  try {
    const { laborId } = req.params;

    // Delete laborer account
    await User.findByIdAndDelete(laborId);

    res.clearCookie("authToken"); // Clear the authentication token
    res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
