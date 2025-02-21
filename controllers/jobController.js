const Job = require("../models/Job");
const User = require("../user/User");
const jwt = require("jsonwebtoken");

// ✅ Create a new job
const createJob = async (req, res) => {
    const { jobTitle, companyName, location, category, salary, description, postedBy } = req.body;

    if (!jobTitle || !companyName || !location || !category || !salary || !description || !postedBy) {
        return res.status(400).json({ error: "⚠️ Missing required fields!" });
    }

    try {
        const newJob = new Job({
            jobTitle,
            companyName,
            location,
            category,
            salary,
            description,
            postedBy,
            filePath: req.file ? `/uploads/${req.file.filename}` : null,
        });

        const savedJob = await newJob.save();

        const user = await User.findById(postedBy);
        if (!user) {
            return res.status(404).json({ error: "❌ User not found!" });
        }

        user.jobsPosted.push(savedJob._id);
        await user.save();

        res.status(201).json({ message: "✅ Job posted successfully!", job: savedJob });
    } catch (error) {
        console.error("Error posting job:", error);
        res.status(500).json({ error: "⚠️ Failed to post job!" });
    }
};

// ✅ Delete a job only if it belongs to the current user
const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "⚠️ Unauthorized: Missing token" });
        }

        // ✅ Decode token using JWT
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // ✅ Find the job
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: "❌ Job not found!" });
        }

        // ✅ Check if the job belongs to the logged-in user
        if (job.postedBy.toString() !== userId) {
            return res.status(403).json({ error: "⛔ Access denied: You can only delete your own jobs" });
        }

        // ✅ Delete the job
        await Job.findByIdAndDelete(jobId);

        // ✅ Remove job from user's `jobsPosted` array
        await User.findByIdAndUpdate(userId, { $pull: { jobsPosted: jobId } });

        res.status(200).json({ message: "✅ Job deleted successfully!" });
    } catch (error) {
        console.error("🚨 Error deleting job:", error.message);
        res.status(500).json({ error: "⚠️ Internal Server Error!" });
    }
};

module.exports = { createJob, deleteJob };
