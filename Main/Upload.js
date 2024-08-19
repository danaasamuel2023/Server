const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const { Profile } = require('../Schema/Schema'); // Adjust the path if needed
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Upload Profile Picture
router.put('/:userId/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profilePicturePath = `/uploads/${req.file.filename}`;

    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (profile.profilePicture) {
      const oldProfilePicturePath = path.join(uploadDir, path.basename(profile.profilePicture));
      fs.unlink(oldProfilePicturePath, (err) => {
        if (err) {
          console.error('Error deleting old profile picture:', err);
        }
      });
    }

    profile.profilePicture = profilePicturePath;
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});


// Get Profile Picture
router.get('/:userId/profile-picture', async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Serve the profile picture URL or path
    res.json({ profilePicture: profile.profilePicture });
  } catch (error) {
    console.error('Error retrieving profile picture:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});


module.exports = router;
