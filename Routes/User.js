const express = require('express');
const router = express.Router();
const { User } = require('../Schema/Schema');
const { authenticate } = require('./authenticate');

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('GET /me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
