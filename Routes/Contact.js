const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Configure email transporter with hard-coded credentials
const transporter = nodemailer.createTransport({
  service: 'Gmail', // You can use other services as needed
  auth: {
    user: 'studentmarketplace2@gmail.com',
    pass: 'neli xmia wtzf bcvn',
  },
});

// Handle contact form submissions
router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: 'studentmarketplace2@gmail.com',
    to: 'danaasamuel20frimpong@gmail.com', // Change this to your support email
    subject: 'Contact Form Submission',
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Contact request submitted successfully' });
  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({ error: 'Failed to submit contact request' });
  }
});

module.exports = router;
