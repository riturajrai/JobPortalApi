require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");

// ✅ Import Job Model
const Job = require("./models/Job.js");

const app = express();

// ✅ Middleware Configuration
app.use(cors({
    origin: "*",  // Allow all origins temporarily (update for production)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB Connection
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/job";
mongoose.connect(MONGO_URL)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Ensure `uploads` Directory Exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// ✅ Multer Storage Configuration
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Max file size: 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG, PNG, or PDF files are allowed'), false);
        }
        cb(null, true);
    }
});

// ✅ API Routes

// 📝 POST: Add a Job
app.post("/api/jobs", upload.single("fileUpload"), async (req, res) => {
    try {
        const { jobTitle, companyName, location, category, salary, description } = req.body;

        if (!jobTitle || !companyName || !location || !category || !salary || !description) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        const newJob = new Job({
            jobTitle,
            companyName,
            location,
            category,
            salary,
            description,
            file: req.file ? req.file.filename : null
        });

        await newJob.save();
        res.status(201).json({ message: "✅ Job posted successfully!", job: newJob });

    } catch (error) {
        console.error("❌ Error posting job:", error);
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});

// 📝 GET: Fetch All Jobs (with optional search)
app.get("/api/jobs", async (req, res) => {
    try {
        const { keyword } = req.query;
        let filter = {};

        if (keyword) {
            filter = {
                $or: [
                    { jobTitle: { $regex: keyword, $options: "i" } }, // Case-insensitive search
                    { companyName: { $regex: keyword, $options: "i" } },
                    { location: { $regex: keyword, $options: "i" } }
                ]
            };
        }

        const jobs = await Job.find(filter);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 📝 GET: Fetch Job by ID
app.get("/api/jobs/:id", async (req, res) => {
    try {
        const jobId = req.params.id;
        console.log(`Fetching job details for ID: ${jobId}`);

        const job = await Job.findById(jobId); 

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.json(job);
    } catch (error) {
        console.error("❌ Error fetching job:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



// ✅ Serve Static Files (Frontend)
app.use(express.static(path.join(__dirname, "Frontend")));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
