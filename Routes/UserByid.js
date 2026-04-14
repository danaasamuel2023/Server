const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { User } = require('../Schema/Schema');
const { optionalAuthenticate } = require('./authenticate');

router.get('/user/:id', optionalAuthenticate, async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: 'Invalid user ID' });

    const user = await User.findById(userId).select('-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Only owner or admin can see sensitive fields (email, role, etc.).
    const isOwner = req.user && String(req.user._id) === String(userId);
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      delete user.email;
      delete user.role;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
