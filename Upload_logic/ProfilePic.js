const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { User, Profile } = require('../Schema/Schema');
const { authenticate } = require('../Routes/authenticate');

const UPLOAD_DIR = 'uploads/';
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

router.post('/', authenticate, async (req, res) => {
  try {
    const { bio, school } = req.body;
    const userId = req.user._id;
    if (school && !mongoose.Types.ObjectId.isValid(school))
      return res.status(400).json({ message: 'Invalid school ID' });
    const profile = new Profile({ user: userId, bio, school });
    await profile.save();
    await User.findByIdAndUpdate(userId, { profile: profile._id });
    res.status(201).json(profile);
  } catch (error) {
    console.error('Profile create error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put(
  '/:id/upload-profile-picture',
  authenticate,
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      const profileId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(profileId))
        return res.status(400).json({ message: 'Invalid ID' });
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

      const existing = await Profile.findById(profileId);
      if (!existing) return res.status(404).json({ message: 'Profile not found' });
      if (String(existing.user) !== String(req.user._id) && req.user.role !== 'admin')
        return res.status(403).json({ message: 'Forbidden' });

      existing.profilePicture = req.file.path;
      await existing.save();
      res.json(existing);
    } catch (error) {
      console.error('Profile pic upload error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/:id', async (req, res) => {
  try {
    const profileId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(profileId))
      return res.status(400).json({ message: 'Invalid ID' });
    const profile = await Profile.findById(profileId)
      .populate('user', '-password')
      .populate('school');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    console.error('Profile get error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
