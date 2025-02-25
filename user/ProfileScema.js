const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    number:{type: Number, required: true},
    age: { type: Number, required: true },
    location: { type: String, required: true },
    groupLink: { type: String, required: true },
    description: { type: String, required: true },
    profileImage: { type: String }
}, { timestamps: true });

const ProfileData = mongoose.model("ProfileData", ProfileSchema);
module.exports = ProfileData;
