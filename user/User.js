// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
}, { timestamps: true });



// Hash the password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10); // Hash password
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
