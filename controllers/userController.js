const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../user/User'); // Ensure correct path
const dotenv = require('dotenv');

dotenv.config(); // Load .env variables

// ✅ SIGNUP FUNCTION
const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered!" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save new user
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        console.log("✅ New User Created:", newUser._id);

        res.status(201).json({
            message: "User registered successfully!",
            user: {
                userId: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).json({ error: "Server error. Failed to register user!" });
    }
};

// ✅ LOGIN FUNCTION
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "❌ User not found!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "❌ Incorrect password!" });
        }

        // ✅ Generate Token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }  // 1 hour validity
        );

        console.log("✅ Generated Token:", token); // Debugging Token

        res.status(200).json({
            message: "🎉 Login successful!",
            user: { userId: user._id, name: user.name, email: user.email },
            token: token, // ✅ Ensure token is included
        });

    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: "⚠️ Server error!" });
    }
};



const refreshToken = async (req, res) => {
    const { token } = req.body;

    if (!token) return res.status(401).json({ error: "Refresh token required" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        // ✅ Check if token exists in DB
        const user = await User.findOne({ _id: decoded.userId, refreshToken: token });
        if (!user) {
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        // ✅ Generate a new access token
        const newAccessToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.status(200).json({ accessToken: newAccessToken });

    } catch (error) {
        console.error("🚨 Refresh Token Error:", error);
        res.status(403).json({ error: "Invalid or expired refresh token" });
    }
};

const logout = async (req, res) => {
    try {
        const { userId } = req.body;
        const token = req.headers.authorization?.split(" ")[1]; // ✅ Extract Token

        if (!token) {
            return res.status(401).json({ message: "⛔ Unauthorized: No Token Provided" });
        }

        // ✅ Verify Token Before Logging Out
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "⛔ Invalid or expired token" });
            }

            // ✅ Remove refresh token from DB
            await User.findByIdAndUpdate(userId, { refreshToken: null });

            res.status(200).json({ message: "✅ User logged out successfully" });
        });

    } catch (error) {
        console.error("🚨 Logout Error:", error);
        res.status(500).json({ error: "Server error during logout" });
    }
};



module.exports = { signup, login  , refreshToken , logout};
