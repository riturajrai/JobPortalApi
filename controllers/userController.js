const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../user/User'); // Adjust the path as needed
const dotenv = require('dotenv');

dotenv.config(); // Load .env variables

// ---------------------- SIGNUP FUNCTION ----------------------
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered!" });
    }

    // Hash the password with 10 salt rounds
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    // Create and save new user
    const newUser = new User({ 
      name: name.trim(), 
      email: email.trim(), 
      password: hashedPassword 
    });
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

// ---------------------- LOGIN FUNCTION ----------------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "❌ Email and password are required!" });
        }
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        const user = await User.findOne({ email: trimmedEmail });
        if (!user) {
            console.error("User not found for email:", trimmedEmail);
            return res.status(400).json({ message: "❌ User not found!" });
        }

        const isMatch = await bcrypt.hash(trimmedPassword, 10);
        console.log("✅ Password Match Status:", isMatch);
        
        if (!isMatch) {
            console.error("Incorrect password for user:", trimmedEmail);
            return res.status(400).json({ message: "❌ Incorrect password!" });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "5h" }
        );

        console.log("✅ Generated Token:", token);

        return res.status(200).json({
            message: "🎉 Login successful!",
            user: { userId: user._id, name: user.name, email: user.email },
            token: token
        });
    } catch (error) {
        console.error("❌ Login Error:", error);
        return res.status(500).json({ message: "⚠️ Server error!" });
    }
};

// ---------------------- REFRESH TOKEN FUNCTION ----------------------
const refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: "Refresh token required" });

  try {
    // Verify the refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // Check if token exists in DB (assuming refreshToken is stored on the user document)
    const user = await User.findOne({ _id: decoded.userId, refreshToken: token });
    if (!user) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }
    
    // Generate a new access token
    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("🚨 Refresh Token Error:", error);
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
};

// ---------------------- LOGOUT FUNCTION ----------------------
const logout = async (req, res) => {
  try {
    const { userId } = req.body;
    const token = req.headers.authorization?.split(" ")[1]; // Extract Token

    if (!token) {
      return res.status(401).json({ message: "⛔ Unauthorized: No Token Provided" });
    }

    // Verify the token before logging out
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "⛔ Invalid or expired token" });
      }
      // Remove refresh token from DB (if stored)
      await User.findByIdAndUpdate(userId, { refreshToken: null });
      res.status(200).json({ message: "✅ User logged out successfully" });
    });
  } catch (error) {
    console.error("🚨 Logout Error:", error);
    res.status(500).json({ error: "Server error during logout" });
  }
};

module.exports = { signup, login, refreshToken, logout };
