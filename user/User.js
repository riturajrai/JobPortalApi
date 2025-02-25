// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        profileImage: { 
            type: String, 
            default: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
        },
    },
    { timestamps: true }
);

// ✅ Hash password before saving (prevents multiple re-hashes)
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);  // Ensure salt is generated
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

module.exports = mongoose.model("User", userSchema);
