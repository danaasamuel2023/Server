const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {User} = require('../Schema/Schema');

// Fetch user details by ID
router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Received user ID:', userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid user ID:', userId);
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
