const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ message: "⛔ Access Denied: No Token Provided!" });
    }
    
    if (!token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "⚠️ Invalid Token Format" });
    }

    const actualToken = token.split(" ")[1];

    try {
        const verified = jwt.verify(actualToken, process.env.JWT_SECRET);
        req.user = verified;  // Attach decoded user info to request
        console.log("✅ Authenticated User ID:", req.user.userId);
        next();
    } catch (err) {
        console.error("Token verification error:", err);
        return res.status(401).json({ message: "⚠️ Invalid Token" });
    }
};

module.exports = authenticateToken;
