const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path'); // Add this line to import the path module
const ProfilePic = require('../models/ProfilePic');
const User = require('../models/User');

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload/profile-pics');
  },
  filename: function (req, file, cb) {
    cb(null, `profilePic-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// Route to handle profile picture upload
router.post('/upload-profile-pic', upload.single('profilePic'), async (req, res) => {
  try {
    const userId = req.body.userId;
    const profilePicUrl = `/uploads/profile-pics/${req.file.filename}`;

    // Update user's profilePic field
    await User.findByIdAndUpdate(userId, { profilePic: profilePicUrl });

    res.json({ message: 'Profile picture uploaded successfully', profilePicUrl });
  } catch (err) {
    res.status(500).json({ message: 'Error uploading profile picture', error: err.message });
  }
});

// Route to get the profile picture URL
router.get('/profile-pic/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profilePicUrl = user.profilePic ? `http://localhost:5000${user.profilePic}` : null;

    res.json({ profilePicUrl });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile picture', error: err.message });
  }
});

module.exports = router;
