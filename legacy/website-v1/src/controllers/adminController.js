import path from "path";
import { User } from "../models/User.js";
import { Job } from "../models/Job.js";
import { Log } from "../models/Log.js";
import { Dispute } from "../models/Dispute.js";
import { Payment } from "../models/Payment.js";
import { timeAgo, getCleanDate } from "../utils/timeUtils.js";







export const renderDashboard = async (req, res) => {
  try {
    const { adminId } = req.params;

    // Check if the logged-in user is accessing their own dashboard
    if (req.user.role !== "admin" || req.user.id !== adminId) {
      return res.status(403).sendFile('src/public/html/unauthorised.html', { root: '.' });
    }

    // Fetch admin details
    const admin = await User.findById(adminId, { name: 1, email: 1, profilePic: 1 });
    if (!admin) {
      return res.status(404).send("Admin not found");
    }

    // Fetch dashboard stats
    const totalUsers = await User.countDocuments({ role: { $in: ["client", "labor"] } });
    const activeJobs = await Job.countDocuments({ status: "active" });
    const pendingDisputes = await Dispute.countDocuments({ status: "open" });
    const totalPayments = await Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]);
      

    // Fetch recent logs (last 5 logs)
    const logs = await Log.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title description createdAt")
      .lean();

    // Format logs for display
    const formattedLogs = logs.map(log => ({
      title: log.title,
      message: log.description,
      time: timeAgo(log.createdAt),
    }));

    // Prepare data for rendering
    const dashboardData = {
      admin: {
        name: admin.name,
        email: admin.email,
        profilePic: admin.profilePic,
      },
      data: {
        totalUsers,
        activeJobs,
        pendingDisputes,
        totalPayments: totalPayments[0]?.totalAmount?.toLocaleString("en-IN") || "0",
      },
      logs: formattedLogs,
      adminId: adminId,
    };

    // Render the admin dashboard page with the fetched data
    res.render("admin-dashboard", dashboardData);
  } catch (error) {
    console.error("Error rendering admin dashboard:", error.message);
    res.status(500).send("Internal Server Error");
  }
};









export const renderDisputeManagement = async (req, res) => {
    try {
      const { adminId } = req.params;
  
      // Check if the logged-in user is accessing their own page
      if (req.user.role !== "admin" || req.user.id !== adminId) {
        return res.status(403).sendFile("src/public/html/unauthorised.html", { root: "." });
      }
      
  
      // Fetch disputes
      const disputes = await Dispute.find({})
        .populate("job", "title")
        .populate("client", "name email")
        .populate("labor", "name email")
        .lean();
  
      // Format disputes for display
      const formattedDisputes = disputes.map(dispute => ({
        jobTitle: dispute.job?.title || "N/A",
        clientName: dispute.client?.name || "N/A",
        laborName: dispute.labor?.name || "N/A",
        description: dispute.description,
        status: dispute.status,
        createdAt: timeAgo(dispute.createdAt),
      }));
  
      // Render the admin dispute management page
      res.render("admin-dispute-management", { disputes: formattedDisputes, adminId: adminId });
    } catch (error) {
      console.error("Error rendering dispute management:", error.message);
      res.status(500).send("Internal Server Error");
    }
  };

  






  export const renderJobManagement = async (req, res) => {
    try {
      const { adminId } = req.params;
  
      // Check if the logged-in user is accessing their own page
      if (req.user.role !== "admin" || req.user.id !== adminId) {
        return res.status(403).sendFile("src/public/html/unauthorised.html", { root: "." });
      }
  
      // Fetch jobs
      const jobs = await Job.find({})
        .populate("client", "name email")
        .lean();
  
      // Format jobs for display
      const formattedJobs = jobs.map(job => ({
        _id: job._id.toString(),
        title: job.title,
        description: job.description,
        location: job.location,
        category: job.category,
        startDate: timeAgo(job.startDate),
        endDate: job.endDate ? getCleanDate(job.endDate) : "N/A",
        budget: job.budget.toLocaleString("en-IN"),
        status: job.status,
        clientName: job.client?.name || "N/A",
      }));
  
      // Render the admin job management page
      res.render("admin-job-management", { jobs: formattedJobs, adminId: adminId });
    } catch (error) {
      console.error("Error rendering job management:", error.message);
      res.status(500).send("Internal Server Error");
    }
  };

  









  export const renderPaymentManagement = async (req, res) => {
    try {
      const { adminId } = req.params;
  
      // Check if the logged-in user is accessing their own page
      if (req.user.role !== "admin" || req.user.id !== adminId) {
        return res.status(403).sendFile("src/public/html/unauthorised.html", { root: "." });
      }
  
      // Fetch payments
      const payments = await Payment.find({})
        .populate("job", "title")
        .populate("client", "name email")
        .populate("laborer", "name email")
        .lean();
  
      // Format payments for display
      const transactions = payments.map(payment => ({
        transactionId: payment.transactionId,
        jobId: payment.job?.title || "N/A",
        client: payment.client?.name || "N/A",
        labor: payment.laborer?.name || "N/A",
        amount: payment.amount.toLocaleString("en-IN"),
        status: payment.status
      }));
  
      // Calculate aggregated totals
      const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString("en-IN");
      const pendingAmount = payments
        .filter(payment => payment.status === "pending")
        .reduce((sum, payment) => sum + payment.amount, 0)
        .toLocaleString("en-IN");
      const successRate = ((payments.filter(payment => payment.status === "completed").length / payments.length) * 100).toFixed(2) + "%";
  

      const paymentsData = {
        transactions,
        data: { totalAmount, pendingAmount, successRate },
        adminId
      }
      // console.log(paymentsData);
      
      // Render the admin payment management page
      res.render("admin-payment-management", paymentsData);
    } catch (error) {
      console.error("Error rendering payment management:", error.message);
      res.status(500).send("Internal Server Error");
    }
  };
  






  export const renderUserManagement = async (req, res) => {
    try {
      const { adminId } = req.params;
  
      // Check if the logged-in user is accessing their own page
      if (req.user.role !== "admin" || req.user.id !== adminId) {
        return res.status(403).sendFile("src/public/html/unauthorised.html", { root: "." });
      }
  
      // Fetch users
      const users = await User.find({ role: { $in: ["client", "labor"] } })
        .select("name email phone role isActive createdAt")
        .lean();
  
      // Format users for display
      const formattedUsers = users.map(user => ({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive ? "Active" : "Inactive",
        createdAt: getCleanDate(user.createdAt),
      }));
  
      // Render the admin user management page
      res.render("admin-user-management", { users: formattedUsers, adminId: adminId });
    } catch (error) {
      console.error("Error rendering user management:", error.message);
      res.status(500).send("Internal Server Error");
    }
  };
  

