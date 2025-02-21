 const express = require('express');
 const router = express.Router();

const jobController = require('../controllers/jobController');
const authenticateToken = require('../middleware/authMiddleware')

router.delete("/:id", authenticateToken, jobController.deleteJob);


module.exports = router