const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "⛔ Access Denied: No Token Provided!" });

    try {
        const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = verified;  // ✅ Attach user ID to request
        console.log("✅ Authenticated User ID:", req.user.userId);
        next();
    } catch (err) {
        res.status(400).json({ message: "⚠️ Invalid Token" });
    }
};


module.exports = authenticateToken;
