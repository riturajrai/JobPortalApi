// models/JobApplication.js
const mongoose = require('mongoose');

// Define the schema for job applications
const jobApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to the User model (if you're using user IDs)
        required: true,
        ref: 'User',  // Assuming you have a User model to reference
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to the Job model
        required: true,
        ref: 'Job',  // Assuming you have a Job model to reference
    },
    jobTitle: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    appliedAt: {
        type: Date,
        default: Date.now,
    },
});

// Create the model from the schema
const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = JobApplication;  // Export the model for use in other files
