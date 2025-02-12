const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");

const app = express();


app.use(cors({
    origin: [
        "http://localhost:3000",  // Allow localhost:3000
        "http://127.0.0.1:5500",  // Allow 127.0.0.1:5500
        "http://localhost:5000",   // If needed, you can allow the same domain as the backend
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Specify allowed methods
    credentials: true            // If you are using cookies/session
}));

// ✅ Middleware
app.use(express.json()); // ✅ Parse JSON data
app.use(express.urlencoded({ extended: true })); // ✅ Parse URL-encoded data

// ✅ Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/jobs", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Ensure `uploads` directory exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// ✅ Configure Multer Storage
const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage });

// ✅ Define Job Schema & Model
const jobSchema = new mongoose.Schema({
    jobTitle: String,
    companyName: String,
    location: String,
    category: String,
    salary: String,
    description: String,
    file: String // Store filename if uploaded
});

const Job = mongoose.model("Job", jobSchema);

// ✅ POST Route to Save Job
app.post("/api/jobs", upload.single("fileUpload"), async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("File Upload:", req.file);

    const { jobTitle, companyName, location, category, salary, description } = req.body;

    if (!jobTitle || !companyName || !location || !category || !salary || !description) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    // ✅ Create a new Job instance
    const newJob = new Job({
        jobTitle,
        companyName,
        location,
        category,
        salary,
        description,
        file: req.file ? req.file.filename : null // File name if uploaded
    });

    try {
        // ✅ Save to MongoDB
        await newJob.save();
        console.log("✅ Job saved to database:", newJob);
        res.status(201).json({ message: "Job posted successfully!", job: newJob });
    } catch (error) {
        console.error("❌ Error saving job:", error);
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});

// ✅ GET Route to Fetch All Jobs
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await Job.find(); // Get all jobs
        res.json(jobs); // Send jobs data directly
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ✅ Start Server
app.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
});
