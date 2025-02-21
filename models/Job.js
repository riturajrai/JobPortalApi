const mongoose = require('mongoose');

// Define the Job schema
const jobSchema = new mongoose.Schema({
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    salary: { type: Number, required: true },
    description: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Reference to User model
    filePath: String,
    createdAt: { type: Date, default: Date.now },
    // Adding an array to store job applications
    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobApplication'  // Reference to the JobApplication model
    }]
});

// Export the Job model
module.exports = mongoose.model('Job', jobSchema);
