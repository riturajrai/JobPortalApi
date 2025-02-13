const mongoose = require("mongoose");
const jobSchema = new mongoose.Schema({
    jobTitle: String,
    companyName: String,
    location: String,
    category: String,
    salary: String,
    description: String,
    file: String,
    createdAt: { type: Date, default: Date.now }
});

const JobModel = mongoose.model("Job", jobSchema);

module.exports = JobModel; // ✅ Make sure you're exporting it
