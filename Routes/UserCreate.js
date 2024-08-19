const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User, School } = require('../Schema/Schema');

// Create a new user
router.post('/create', async (req, res) => {
  try {
    const { username, password, email, schoolId, role } = req.body;

    // Validate if the school ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({ message: 'Invalid school ID format' });
    }

    // Check if the school exists
    const schoolExists = await School.findById(schoolId);
    if (!schoolExists) {
      return res.status(400).json({ message: 'School ID does not exist' });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      school: schoolId,
      role
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
