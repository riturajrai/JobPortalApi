const JobApplication = require('../user/Jobapplications'); // ✅ Ensure correct path
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // ✅ Make sure JWT is imported

// ✅ Apply for a Job
const applyForJob = async (req, res) => {
    try {
        console.log("📥 Received Request Body:", req.body); // ✅ Check Incoming Request

        const { jobId, jobTitle, companyName, userId } = req.body; // ✅ Extract userId from body

        if (!userId || !jobId || !jobTitle || !companyName) {
            return res.status(400).json({ message: "⚠️ Missing required fields!" });
        }

        // ✅ Check if the user has already applied
        const alreadyApplied = await JobApplication.findOne({ userId, jobId });
        if (alreadyApplied) {
            return res.status(400).json({ message: "⚠️ You have already applied for this job!" });
        }
        // ✅ Save the new application
        const newApplication = new JobApplication({
            userId,
            jobId,
            jobTitle,
            companyName,
            appliedAt: new Date()
        });

        await newApplication.save();
        res.status(201).json({ message: "✅ Successfully applied for the job!" });

    } catch (error) {
        console.error("❌ Apply Job Error:", error);
        res.status(500).json({ message: "Error applying for the job.", error: error.message });
    }
};

// ✅ Delete Applied Job
const deleteAppliedJob = async (req, res) => {
    try {
        const appliedJobId = req.params.id; // ✅ Applied Job ID
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "⚠️ Unauthorized: Missing token" });
        }

        // ✅ Decode token using JWT
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // ✅ Find the applied job
        const appliedJob = await JobApplication.findById(appliedJobId);
        if (!appliedJob) {
            return res.status(404).json({ error: "❌ Applied job not found!" });
        }

        // ✅ Check if the job was applied by the logged-in user
        if (appliedJob.userId.toString() !== userId) {
            return res.status(403).json({ error: "⛔ Access denied: You can only delete your own applied jobs" });
        }

        // ✅ Delete the applied job
        await JobApplication.findByIdAndDelete(appliedJobId);

        res.status(200).json({ message: "✅ Applied job deleted successfully!" });
    } catch (error) {
        console.error("🚨 Error deleting applied job:", error.message);
        res.status(500).json({ error: "⚠️ Internal Server Error!" });
    }
};

// ✅ Get Applied Jobs for a User
const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.params.userId || req.body.userId; // ✅ Get userId from params or body
        console.log("👤 Fetching Applied Jobs for User ID:", userId);

        if (!userId) {
            return res.status(400).json({ error: "⛔ Missing user ID!" });
        }

        // ✅ Fetch user's applied jobs
        const appliedJobs = await JobApplication.find({ userId });

        if (!appliedJobs.length) {
            return res.status(404).json({ message: "🔍 No applied jobs found." });
        }

        return res.status(200).json(appliedJobs);
    } catch (error) {
        console.error("❌ Error fetching applied jobs:", error);
        res.status(500).json({ error: "⚠️ Server error" });
    }
};

// ✅ GET Applied Job by ID
const getAppliedJobById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("🔍 Fetching applied job with ID:", id);

        const job = await JobApplication.findById(id);
        if (!job) {
            return res.status(404).json({ message: "❌ Applied job not found!" });
        }

        res.status(200).json(job);
    } catch (error) {
        console.error("❌ Error fetching applied job:", error);
        res.status(500).json({ message: "❌ Server error fetching applied job.", error: error.message });
    }
};

const Savedjob = async  (req , res) => {
    try{
        const {id} = req.params;
        console.log("📩 Sending saved job data with ID:", id);
       const job = await JobApplication.findById(id)

       if(!mongoose.Types.ObjectId.isValid(id)){
        return  res.status(200).json({ message: "✅ Data fetched successfully", jobId: id });
       }
       console.log("📩 Sending saved job data with ID:", id);

  
        if (!job) {
            return res.status(404).json({ message: "❌ Job not found!" });
        }
        res.status(200).json({ message: "✅ Data fetched successfully", job });
    } catch(error){
        console.error("data has been not fateched", error )
        res.status(403).json({message: "data has been not fateched" , error : error.message})
    }
}
module.exports = {
    applyForJob,
    getAppliedJobs,
    getAppliedJobById, // ✅ Added missing export
    deleteAppliedJob,
    Savedjob
};
