const Job = require("../models/Job");
const User = require("../user/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const  ProfileData = require('../user/ProfileScema');


const createJob = async (req, res) => {
    console.log("📩 Incoming Job Data:", req.body); // 🔥 Debugging

    const { jobTitle, companyName, location, category, salary, description, postedBy, jobtype } = req.body;

    // ✅ Check if `req.body` is empty
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "⚠️ Request body is empty! Check Content-Type and JSON data." });
    }

    // Validate required fields
    if (!jobTitle || !companyName || !location || !category || !salary || !description || !postedBy || !jobtype) {
        return res.status(400).json({ error: "⚠️ Missing required fields!", received: req.body });
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(postedBy)) {
            return res.status(400).json({ error: "❌ Invalid user ID format!" });
        }

        const userId = new mongoose.Types.ObjectId(postedBy);

        const newJob = new Job({
            jobTitle,
            companyName,
            location,
            category,
            salary,
            description,
            postedBy: userId,
            jobtype,
            filePath: req.file ? `/uploads/${req.file.filename}` : null,
        });

        const savedJob = await newJob.save();

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "❌ User not found!" });
        }

        if (!user.jobsPosted) {
            user.jobsPosted = [];
        }
        user.jobsPosted.push(savedJob._id);
        await user.save();

        res.status(201).json({ message: "✅ Job posted successfully!", job: savedJob });
    } catch (error) {
        console.error("❌ Error posting job:", error);
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

const createProfile = async (req, res) => {
    try {
        console.log("🔹 Received Request Body:", req.body); // 👉 Debugging

        const { userId, name, email, number, age, location, groupLink, description, profileImage } = req.body;

        // ✅ Validate Required Fields
        if (!userId || !name || !email || !number) {
            console.error("⚠️ Missing Fields in Request Body:", { userId, name, email, number }); // 👉 Debugging
            return res.status(400).json({ error: "⚠️ User ID, Name, Email, and Phone Number are required!" });
        }

        let profile = await ProfileData.findOne({ userId });

        if (profile) {
            profile.name = name;
            profile.email = email;
            profile.number = number;  // ✅ Ensure `number` field is updated
            profile.age = age;
            profile.location = location;
            profile.groupLink = groupLink;
            profile.description = description;
            profile.profileImage = profileImage;

            await profile.save();
            console.log("✅ Profile updated successfully!");
            return res.status(200).json({ message: "✅ Profile updated successfully!", profile });
        } else {
            profile = new ProfileData({
                userId, name, email, number, age, location, groupLink, description, profileImage
            });

            await profile.save();
            console.log("✅ Profile created successfully!");
            return res.status(201).json({ message: "✅ Profile created successfully!", profile });
        }
    } catch (error) {
        console.error("⚠️ Server Error:", error);
        res.status(500).json({ error: "⚠️ Internal Server Error!" });
    }
};
const getProfile = async (req, res) => {
    try {
        let { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, error: "⚠️ User ID is required!" });
        }

        // 🔹 Convert `userId` to ObjectId if needed
        if (mongoose.Types.ObjectId.isValid(userId)) {
            userId = new mongoose.Types.ObjectId(userId);
        }

        // ✅ Find profile using `userId`
        const userProfile = await ProfileData.findOne({ userId });

        if (!userProfile) {
            return res.status(404).json({ success: false, error: "⚠️ Profile not found!" });
        }

        res.status(200).json({ success: true, data: userProfile });

    } catch (error) {
        console.error("⚠️ Server Error:", error);
        res.status(500).json({ success: false, error: "⚠️ Failed to fetch profile!" });
    }
};

module.exports = { createJob, deleteJob ,createProfile , getProfile};
