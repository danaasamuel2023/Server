const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const mongoose = require('mongoose');
const { User } = require('../Schema/Schema');
const { authenticate } = require('./authenticate');

const UPLOAD_DIR = 'upload/profile-pics';
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return cb(new Error('Invalid file extension'));
    cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) return cb(new Error('Invalid file type'));
    cb(null, true);
  },
});

router.post('/upload-profile-pic', authenticate, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const userId = req.user._id;
    const profilePicUrl = `/upload/profile-pics/${req.file.filename}`;
    await User.findByIdAndUpdate(userId, { profilePic: profilePicUrl });
    res.json({ message: 'Profile picture uploaded successfully', profilePicUrl });
  } catch (err) {
    console.error('Upload profile pic error:', err);
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
});

router.get('/profile-pic/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: 'Invalid ID' });
    const user = await User.findById(userId).select('profilePic');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ profilePicUrl: user.profilePic || null });
  } catch (err) {
    console.error('Get profile pic error:', err);
    res.status(500).json({ message: 'Error fetching profile picture' });
  }
});

module.exports = router;
