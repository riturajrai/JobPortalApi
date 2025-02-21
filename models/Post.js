const express = require("express");
const router = express.Router();
const upload = require("../middleware/fileUpload"); // File upload middleware
const authenticateToken = require("../middleware/authMiddleware");
const jobController = require("../controllers/jobController");
const userController = require("../controllers/userController");
const updateProfile = require("../controllers/profileRoutes");
const { applyForJob, checkAppliedJob, getAppliedJobs, deleteAppliedJob } = require("../controllers/appliedjob");

// ✅ User Authentication Routes
router.post("/users/signup", upload.single("profileImage"), userController.signup);
router.post("/users/login", userController.login);
router.post("/users/logout", authenticateToken, userController.logout); // 🔥 Now protected
router.post("/users/refresh-token", userController.refreshToken);

// ✅ Profile Update Route (Use PUT instead of POST)
router.put("/users/profile", authenticateToken, updateProfile);

// ✅ Job Routes
router.post("/jobs", authenticateToken, jobController.createJob);

// ✅ Apply for a Job Route
router.post("/applied-jobs", authenticateToken, applyForJob);

// ✅ Delete Job Route (Protected)
router.delete("/applied-jobs/delete/:id", authenticateToken, deleteAppliedJob);

module.exports = router;
