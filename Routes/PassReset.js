const express = require('express');
const router = express.Router();
const { User } = require('../Schema/Schema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'unimarketgh@gmail.com',
    pass: 'fojo dxyg hfpg rspd', 
  },
});

// Request password reset
router.post('/request-reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY || 'unimarketgh' , { expiresIn: '1h' });
    const resetLink = `http://localhost:5173/reset-password/${token}`;

    // Send password reset email
    await transporter.sendMail({
      from: '"UniMarket Team" <no-reply@unimarketgh.com>',
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p style="color: #555; font-size: 16px;">Hello ${user.username || 'User'},</p>
          <p style="color: #555; font-size: 16px;">We received a request to reset your password for your UniMarket account.</p>
          <p style="color: #555; font-size: 16px;">If you did not request this, please ignore this email. Otherwise, click the button below to reset your password:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Reset Password</a>
          </div>
          <p style="color: #555; font-size: 16px;">Or you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #007bff;">${resetLink}</p>
          <p style="color: #999; font-size: 14px; text-align: center;">If you have any questions, please contact our support team at +233597760914.</p>
          <p style="color: #999; font-size: 14px; text-align: center;">Thank you,<br/>The UniMarket Team</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Reset link sent to your email' });
  } catch (error) {
    console.error('Error sending reset email:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
