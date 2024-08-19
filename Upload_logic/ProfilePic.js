// server/routes/profileRoutes.js

const express = require('express');
const router = express.Router();
const { User } = require('../Schema/Schema');
const {Profile} = require('../Schema/Schema');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/', async (req, res) => {
  try {
    const { userId, bio, school } = req.body;

    const profile = new Profile({ user: userId, bio, school });
    await profile.save();

    await User.findByIdAndUpdate(userId, { profile: profile._id });

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.put('/:id/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    const profileId = req.params.id;
    const profilePicturePath = req.file.path;

    const profile = await Profile.findByIdAndUpdate(profileId, { profilePicture: profilePicturePath }, { new: true });

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const profileId = req.params.id;
    const profile = await Profile.findById(profileId).populate('user').populate('school');

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
