const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.CONTACT_EMAIL_USER,
    pass: process.env.CONTACT_EMAIL_PASS,
  },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many contact submissions. Try again later.' },
});

router.post(
  '/contact',
  contactLimiter,
  [
    body('name').isString().trim().isLength({ min: 1, max: 200 }),
    body('email').isEmail().normalizeEmail(),
    body('message').isString().trim().isLength({ min: 1, max: 5000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid input' });

    const { name, email, message } = req.body;
    const mailOptions = {
      from: process.env.CONTACT_EMAIL_USER,
      to: 'danaasamuel20frimpong@gmail.com',
      subject: 'Contact Form Submission',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Contact request submitted successfully' });
    } catch (error) {
      console.error('Failed to send email:', error);
      res.status(500).json({ message: 'Failed to submit contact request' });
    }
  }
);

module.exports = router;
