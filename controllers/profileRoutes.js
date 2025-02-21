const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile', authenticateToken, (req, res) => {  // ✅ Ensure this is a function
    const user = req.user;

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
    });
});

module.exports = router;
