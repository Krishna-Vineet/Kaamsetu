import bcrypt from 'bcrypt';
import {User} from '../models/User.js';
import { Log } from '../models/Log.js';
import {Job} from "../models/Job.js";
import {Dispute} from "../models/Dispute.js";
import {Payment} from "../models/Payment.js";
import { timeAgo, getCleanDate } from "../utils/timeUtils.js";
import {generateToken} from '../utils/jwtUtils.js';
import mongoose from 'mongoose';
import { log, timeStamp } from 'console';
import { v2 as cloudinary } from 'cloudinary';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';


export const handleClientRegistration = async (req, res) => {
    const { name, email, phone, password, confirmPassword, address, company, pincode } = req.body;

    
    try {
        // Validate required fields
        if (!name || !email || !phone || !password || !confirmPassword || !address || !pincode) {
            return res.status(400).json({ message: 'Please fill all required fields.' });
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
        }

        // Check if email or phone already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or phone number already registered.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new client user
        const newClient = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            address,
            company: company || '', // Optional field
            role: 'client',
            pin: pincode, 
        });

        // Create log
        await Log.create({
            title: "New Client Registration",
            description: `New client ${name} with email ${email} has successfully registered.`,
            link: `/client/dashboard/${newClient._id}`,
        });


        // Generate JWT token
        const token = generateToken({ id: newClient._id, role: newClient.role });

        res
        .status(201)
        .cookie('authToken', token, {
            httpOnly: true,  // Prevent client-side JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict', // Prevent CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        })
        .json({
            message: 'Client registered successfully!',
            clientId: newClient._id,
        });
    } catch (err) {
        console.error('Error during client registration:', err.message);
        res.status(500).json({ message: 'An error occurred during registration.' });
    }
};




export const renderProfile = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Authorization
    if (req.user.role !== "client" || req.user.id !== clientId) {
      return res.status(403).sendFile("src/public/html/unauthorised.html", { root: "." });
    }

    // Fetch client data
    const client = await User.findById(clientId)
      .select("name email phone address profilePic")
      .lean();

    // Calculate stats
    const totalJobs = await Job.countDocuments({ client: clientId });
    const totalSpent = await Payment.aggregate([
      {
        $match: { client: new mongoose.Types.ObjectId(clientId), status: "completed" }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" }
      }
      }
    ])
    const activeJobs = await Job.countDocuments({ client: clientId, status: "active" });
    const disputes = await Dispute.countDocuments({ client: clientId, status: "open" });

    // Format profile data
    const formattedData = {
      client: {
        ...client,
        avatar: client.profilePic || "",
        totalJobs,
        activeJobs,
        disputes,
        totalSpent // Will be populated via payment aggregation later
      },
      clientId
    };

    res.render("client-profile", formattedData);
  } catch (error) {
    console.error("Error rendering profile:", error.message);
    res.status(500).send("Internal Server Error");
  }
};


export const renderDashboard = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Authorization
    if (req.user.role !== "client" || req.user.id !== clientId) {
      return res.status(403).sendFile("src/public/html/unauthorised.html", { root: "." });
    }

    // Aggregate data in single query
    const [stats, jobs, disputes] = await Promise.all([
      // Total Spent (from completed payments)
      Payment.aggregate([
        { $match: { client: new mongoose.Types.ObjectId(clientId), status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      
      // Active/Pending Jobs
      Job.find({ client: clientId, status: { $in: ["active", "posted"] } })
        .populate("applied", "name")
        .populate("laborers", "name")
        .lean(),
      
      // Open Disputes
      Dispute.find({ client: clientId, status: "open" })
        .populate("job", "title")
        .lean()
    ]);

    // Format data
    const formattedData = {
      data: {
        totalJobs: await Job.countDocuments({ client: clientId }),
        activeJobs: await Job.countDocuments({ client: clientId, status: "active" }),
        totalSpent: (stats[0]?.total || 0).toLocaleString("en-IN"),
        openDisputes: disputes.length
      },
      jobs: jobs.map(job => ({
        jobId: job._id,
        title: job.title,
        appliedLaborers: job.applied.map(l => ({ id: l._id, name: l.name })),
        laborers: job.laborers.map(l => ({ id: l._id, name: l.name })),
        status: job.status === "awaitingSelection" ? "pending" : job.status
      })),
      disputes: disputes.map(d => ({
        jobTitle: d.job?.title || "Deleted Job",
        description: d.description,
        status: d.status
      })),
      clientId
    };

    res.render("client-dashboard", formattedData);
  } catch (error) {
    console.error("Error rendering dashboard:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

export const getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Find job and verify client ownership
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to view applicants" });
    }

    // Fetch applied laborers and populate their details
    const applicants = await User.find(
      { _id: { $in: job.applied } },
      "name completionRate"
    );

    res.status(200).json({ applicants });
  } catch (error) {
    next(error); // Handle errors using middleware
  }
};

export const approveLaborers = async (req, res, next) => {
  try {

    const { jobId } = req.params;
    const { laborers } = req.body;

    // Validate request
    if (!laborers || !Array.isArray(laborers) || laborers.length === 0) {
      return res.status(400).json({ error: "At least one laborer must be selected" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to approve laborers" });
    }

    if (job.status !== "posted") {
      return res.status(400).json({ error: "Job is not in a selectable state" });
    }

    // Updating job
    job.status = "active";
    job.laborers = laborers;

    await job.save();


const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;

// Create payment instances when job gets activated
const payments = job.laborers.map((laborer) => ({
  job: job._id,
  client: job.client,
  laborer,
  amount: job.budget / job.laborers.length, // Divide budget equally
  status: "pending",
  dueDate: new Date(Date.now() + ONE_MONTH_IN_MS), // 1 month from activation
  doneDate: null,
  transactionId: null,
}));

await Payment.insertMany(payments);
console.log("✅ Payments Created Successfully");

    // Creating a log entry
    await Log.create({
      title: "Job Started",
      description: `Job "${job.title}" has been started with selected laborers.`,
      link: `/client/job-details/${jobId}`,
    });

    res.status(200).json({ message: "Job started successfully", job });
  } catch (error) {
    console.error("Error:", error);
    next(error);
  }
};

export const cancelJob = async (req, res, next) => {
  try {

    const { jobId } = req.params;

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Ensure only the client who created the job can cancel it
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to cancel this job" });
    }

    // Ensure job is not already completed or canceled
    if (["completed", "cancelled"].includes(job.status)) {
      return res.status(400).json({ error: "Job is already completed or cancelled" });
    }

    await Job.deleteOne({ _id: jobId });

    return res.status(200).json({ message: "Job cancelled successfully" });
  } catch (error) {
    next(error);
  }
};




export const renderPastJobs = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Authorization check
    if (req.user.role !== "client" || req.user.id !== clientId) {
      return res.status(403).sendFile("src/public/html/unauthorised.html", { root: "." });
    }

    // Fetch jobs with status completed/cancelled
    const jobs = await Job.find({
      client: clientId,
      status: { $in: ["completed", "cancelled"] }
    }).lean();

    // Format jobs
    const formattedData = {
      completedJobs: jobs
        .filter(j => j.status === "completed")
        .map(job => ({
          title: job.title,
          startDate: getCleanDate(job.startDate),
          completionDate: getCleanDate(job.endDate),
          totalCost: job.cost || "N/A",
          status: job.status
        })),
      cancelledJobs: jobs
        .filter(j => j.status === "cancelled")
        .map(job => ({
          title: job.title,
          description: job.description,
          startDate: getCleanDate(job.startDate),
          cancellationDate: getCleanDate(job.endDate),
          reason: job.cancelationReason || "Not specified",
          status: job.status
        })),
      clientId
    };

    res.render("client-past-jobs", formattedData);
  } catch (error) {
    console.error("Error rendering past jobs:", error.message);
    res.status(500).send("Internal Server Error");
  }
};


export const renderPayments = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Authorization
    if (req.user.role !== "client" || req.user.id !== clientId) {
      return res.status(403).sendFile("src/public/html/unauthorised.html", { root: "." });
    }

    // Fetch payment data
    const [payments, paymentHistory] = await Promise.all([
      Payment.find({ client: clientId, status: "pending" })
        .populate("job", "title")
        .lean(),
      Payment.find({ client: clientId, status: "completed" })
        .populate("job", "title")
        .lean()
    ]);

    // Calculate totals
    const totalSpent = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = payments.reduce((sum, p) => sum + p.amount, 0);

    // Format data
    const formattedData = {
      data: {
        totalSpent: totalSpent.toLocaleString("en-IN"),
        pendingPayments: pendingPayments.toLocaleString("en-IN"),
        completedPayments: totalSpent.toLocaleString("en-IN")
      },
      pendingPayments: payments.map(p => ({
        jobTitle: p.job?.title || "Deleted Job",
        jobId: p.job?._id.toString() || "N/A",
        amountDue: p.amount.toLocaleString("en-IN"),
        dueDate: getCleanDate(p.dueDate),
        status: p.status
      })),
      paymentHistory: paymentHistory.map(p => ({
        jobTitle: p.job?.title || "Deleted Job",
        jobId: p.job?._id.toString() || "N/A",
        amountPaid: p.amount.toLocaleString("en-IN"),
        paymentDate: getCleanDate(p.doneDate),
        upiId: req.user.upiId || "N/A", // From authenticated user
        status: p.status
      })),
      clientId
    };

    res.render("client-payment", formattedData);
  } catch (error) {
    console.error("Error rendering payments:", error.message);
    res.status(500).send("Internal Server Error");
  }
};


// export const renderManageJob = async (req, res) => {
//   try {
//     const { clientId } = req.params;
    
//     // Authorization
//     if (req.user.role !== "client" || req.user.id !== clientId) {
//       return res.status(403).sendFile("src/public/html/unauthorised.html", { root: "." });
//     }

//     // Assuming jobId is passed via query params
//     const jobId = req.query.jobId;
//     if (!jobId) return res.status(400).send("Job ID required");

//     // Fetch job details
//     const job = await Job.findById(jobId)
//       .populate("laborers", "name skills phone")
//       .populate("updates")
//       .lean();

//     // Calculate cost from payments
//     const payments = await Payment.find({ job: jobId });
//     const totalCost = payments.reduce((sum, p) => sum + p.amount, 0);

//     // Format data
//     const formattedData = {
//       job: {
//         title: job.title,
//         jobId: job._id.toString(),
//         startDate: getCleanDate(job.startDate),
//         expectedEndDate: getCleanDate(job.endDate),
//         location: job.location,
//         status: job.status,
//         description: job.description,
//         budget: job.budget.toLocaleString("en-IN"),
//         cost: totalCost.toLocaleString("en-IN")
//       },
//       team: job.laborers.map(laborer => ({
//         name: laborer.name,
//         skill: laborer.skills?.join(", ") || "General Labor",
//         phone: laborer.phone,
//         status: "active" // Assuming all populated laborers are active
//       })),
//       jobUpdates: job.updates.map(update => ({
//         title: update.title,
//         date: timeAgo(update.timeStamp),
//         description: update.text
//       })),
//       clientId
//     };

//     res.render("client-manage-jobs", formattedData);
//   } catch (error) {
//     console.error("Error rendering job management:", error.message);
//     res.status(500).send("Internal Server Error");
//   }
// };



// Render manage jobs page


export const renderManageJobPage = async (req, res) => {
  try {
    const { clientId, jobId } = req.params;

    // Authorization check
    if (req.user.role !== "client" || req.user.id !== clientId) {
      return res.status(403).sendFile("src/public/html/unauthorised.html", { 
        root: "." 
      });
    }

    // Fetch all active jobs for the client
    const jobdata = await Job.find({ client: clientId, status: "active" });

    const jobs = jobdata.map(job => ({
      title: job.title,
      jobId: job._id.toString(),
      startDate: getCleanDate(job.startDate),
      location: job.location,
      status: job.status
      }));

    // Render the template with all job data
    res.render("client-manage-jobs", {clientId, jobs});

  } catch (error) {
    console.error("Error rendering manage jobs page:", error.message);
    res.status(500).send("Internal Server Error");
  }
};



export const approveLaborer = async (req, res) => {
  try {
    const { clientId, jobId } = req.params;
    const { laborerId } = req.body;

    // Authorization check
    if (req.user.role !== "client" || req.user.id !== clientId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    // Move laborer from `applied` to `laborers`
    job.laborers.push(laborerId);
    job.applied = job.applied.filter(id => id.toString() !== laborerId);
    await job.save();

    res.status(200).json({ success: true, message: "Laborer approved successfully" });
  } catch (error) {
    console.error("Error approving laborer:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const rejectLaborer = async (req, res) => {
  try {
    const { clientId, jobId } = req.params;
    const { laborerId } = req.body;

    // Authorization check
    if (req.user.role !== "client" || req.user.id !== clientId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    // Remove laborer from `applied`
    job.applied = job.applied.filter(id => id.toString() !== laborerId);
    await job.save();

    res.status(200).json({ success: true, message: "Laborer rejected successfully" });
  } catch (error) {
    console.error("Error rejecting laborer:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// Render Job Post Page
export const renderJobPostPage = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Authorization check
    if (req.user.role !== 'client' || req.user.id !== clientId) {
      return res.status(403).render('error', { 
        message: 'Unauthorized access' 
      });
    }

    // Categories data to pass to template
    const categories = {
      'home-services': ['Electrical', 'Plumbing', 'Carpentry'],
      'repair': ['Appliance', 'Electronics', 'Vehicle'],
      'cleaning': ['Home', 'Office', 'Industrial'],
      'painting': ['Interior', 'Exterior', 'Commercial']
    };

    res.render('client-job-post', {
      clientId,
      categories,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    });

  } catch (error) {
    console.error('Error rendering job post page:', error);
    res.status(500).render('error', { 
      message: 'Failed to load job post page' 
    });
  }
};




export const handleJobPost = async (req, res) => {
  try {
    // console.log("Received Body:", req.body);  // 🔍 Debug Text Fields
    // console.log("Received Files:", req.files); // 🔍 Debug Uploaded Files

    const { clientId } = req.params;
    const clientname = await User.findById(clientId).select('name').lean();
    const { title, description, category, subCategory, location, startDate, endDate, budget } = req.body;

    // Check if req.body is empty
    if (!title || !description || !category || !location || !startDate || !budget) {
      return res.status(400).json({ error: "Missing required fields: title, description, category, location, startDate, budget" });
    }

    // Process uploaded media
    // Process uploaded media
const mediaUrls = [];
for (let i = 1; i <= 5; i++) {
  const file = req.files[`media${i}`]?.[0];
  if (file) {
    const result = await uploadOnCloudinary(file.path);
    if (result) {
      mediaUrls.push({
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type
      });
    }
  }
}


    // Save job to DB
    const newJob = await Job.create({
      title,
      description,
      location,
      category,
      subCategory: subCategory || "",
      media: mediaUrls,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      budget: Number(budget),
      client: clientId,
      status: "posted"
    });

    // Log entry
    await Log.create({
      title: "New Job Posted",
      description: `Client ${clientname} posted: ${title}`,
      link: `/client/manage-job/${clientId}/jobs/${newJob._id}`
    });

    return res.status(201).json({ success: true, jobId: newJob._id });

  } catch (error) {
    console.error("Job post error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};



// Fetch all active jobs for a client
export const getClientJobs = async (req, res) => {
  try {
    const { clientId } = req.params;
    const jobs = await Job.find({ client: clientId, status: { $ne: "completed" } })
      .select("_id title location startDate status");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs" });
  }
};

// Fetch details of a specific job
export const getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Fetch the job by ID and populate related fields
    const job = await Job.findById(jobId)
      .populate("client", "name email") // Populate client details
      .populate("laborers", "name phone") // Populate laborers/team members
      .populate("updates", "title text timeStamp"); // Populate job updates

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const formattedUpdates = job.updates.map(update => ({
      ...update.toObject(),
      timeStamp: timeAgo(update.timeStamp), // Convert timeStamp to timeAgo format
    }));


    // Format dates for better readability
    const formattedJob = {
      ...job.toObject(),
      startDate: getCleanDate(job.startDate),
      expectedEndDate: getCleanDate(job.endDate),
      updates: formattedUpdates
      
    };

    // console.log(formattedJob);
    
    res.status(200).json(formattedJob);
  } catch (error) {
    console.error("Error fetching job details:", error);
    res.status(500).json({ message: "Error fetching job details" });
  }
};

// Add an update to a job
export const addJobUpdate = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { title, description } = req.body;

    console.log(req.body);
    console.log(req.params);
    
    const job = await Job.findByIdAndUpdate(
      jobId,
      { $push: { updates: { title, text: description, timeStamp: new Date() } } },
      { new: true }
    );
    const update = {
      title: job.updates.at(-1).title,
      text: job.updates.at(-1).text,
      timeStamp: timeAgo(job.updates.at(-1).timeStamp)
    }
    
    res.json({ message: "Update added", update});
  } catch (error) {
    res.status(500).json({ message: error.message || "Error adding update" });
  }
};