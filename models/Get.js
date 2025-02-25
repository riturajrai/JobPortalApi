const express = require("express");
const router = express.Router();
const upload = require("../middleware/fileUpload"); // File upload middleware
const Job = require("../models/Job"); // Job model
const User = require("../user/User"); // User model (Corrected path)
const authenticateToken = require("../middleware/authMiddleware"); 
const  jobController = require('../controllers/jobController')
const { getAppliedJobs, getAppliedJobById, deleteAppliedJob , Savedjob} = require("../controllers/appliedjob"); // ✅ Ensure curly braces are used

// ✅ Fetch All Jobs with Optional Keyword Filter (GET)
router.get("/jobs", async (req, res) => {
    try {
        const { keyword } = req.query;
        let filter = {};

        if (keyword) {
            filter = {
                $or: [
                    { jobTitle: { $regex: keyword, $options: "i" } },
                    { companyName: { $regex: keyword, $options: "i" } },
                    { location: { $regex: keyword, $options: "i" } }
                ]
            };
        }

        const jobs = await Job.find(filter);
        res.json(jobs);
    } catch (error) {
        console.error("❌ Error fetching jobs:", error.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Fetch Job by ID (GET)
router.get("/jobs/:id", async (req, res) => {
    try {
        const jobId = req.params.id;
        console.log(`Fetching job details for ID: ${jobId}`);

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.json(job);
    } catch (error) {
        console.error("❌ Error fetching job:", error.stack);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
router.get("/savedjob/:id",authenticateToken, Savedjob);

router.get("/profile/:userId"  ,jobController.getProfile )

// ✅ Fetch Applied Jobs by User ID (GET)
router.get("/applied-jobs/:userId", authenticateToken, getAppliedJobs);

// ✅ Fetch Specific Applied Job by ID (GET)
router.get("/applied-jobs/job/:id", authenticateToken, getAppliedJobById);
router.get("/applied-jobs/delete/:id", authenticateToken, deleteAppliedJob);
module.exports = router;
