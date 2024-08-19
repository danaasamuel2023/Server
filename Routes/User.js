const express = require('express');
const router = express.Router();
const {User} = require('../Schema/Schema'); // Adjust path as needed
const authenticate = require('../Routes/authenticate'); // Middleware to check token

// Get user information
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Get user ID from token
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
