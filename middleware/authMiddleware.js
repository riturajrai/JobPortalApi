const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const authHeader = req.header("Authorization");

    console.log("🔹 Received Auth Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "⛔ Access Denied: No or Invalid Token Provided!" });
    }

    const token = authHeader.split(" ")[1];

    console.log("🔹 Extracted Token:", token);

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        console.log("✅ Authenticated User ID:", req.user.userId);
        next();
    } catch (err) {
        console.error("❌ Token Verification Error:", err);
        return res.status(401).json({ message: "⚠️ Invalid Token" });
    }
};

module.exports = authenticateToken;
