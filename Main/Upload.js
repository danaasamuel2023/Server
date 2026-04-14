const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Profile } = require('../Schema/Schema');
const { authenticate } = require('../Routes/authenticate');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
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

router.put(
  '/:userId/upload-profile-picture',
  authenticate,
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      const userId = req.params.userId;
      if (!mongoose.Types.ObjectId.isValid(userId))
        return res.status(400).json({ message: 'Invalid user ID' });
      if (String(userId) !== String(req.user._id) && req.user.role !== 'admin')
        return res.status(403).json({ message: 'Forbidden' });
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

      const profilePicturePath = `/uploads/${req.file.filename}`;
      const profile = await Profile.findOne({ user: userId });
      if (!profile) return res.status(404).json({ message: 'Profile not found' });

      if (profile.profilePicture) {
        const oldPath = path.join(uploadDir, path.basename(profile.profilePicture));
        // Guard against path traversal by confirming basename stays within dir
        if (path.dirname(oldPath) === uploadDir) {
          fs.unlink(oldPath, (err) => {
            if (err && err.code !== 'ENOENT')
              console.error('Error deleting old profile picture:', err);
          });
        }
      }

      profile.profilePicture = profilePicturePath;
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/:userId/profile-picture', async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: 'Invalid user ID' });
    const profile = await Profile.findOne({ user: userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json({ profilePicture: profile.profilePicture });
  } catch (error) {
    console.error('Error retrieving profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
