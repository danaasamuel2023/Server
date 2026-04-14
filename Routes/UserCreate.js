const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { User, School } = require('../Schema/Schema');

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many registration attempts. Try again later.' },
});

router.post(
  '/create',
  registerLimiter,
  [
    body('username').isString().trim().isLength({ min: 2, max: 50 }),
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .matches(/[A-Za-z]/)
      .matches(/\d/)
      .withMessage('Password must be at least 8 characters and contain letters and numbers'),
    body('schoolId').isString().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg || 'Invalid input' });

    try {
      const { username, password, email, schoolId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        return res.status(400).json({ message: 'Invalid school ID format' });
      }

      const schoolExists = await School.findById(schoolId);
      if (!schoolExists) {
        return res.status(400).json({ message: 'School ID does not exist' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = new User({
        username,
        password: hashedPassword,
        email,
        school: schoolId,
        // role is NEVER accepted from request body — prevents privilege escalation.
        role: 'student',
      });

      await newUser.save();

      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error('UserCreate error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
