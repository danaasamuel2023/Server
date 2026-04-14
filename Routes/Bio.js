const express = require('express');
const router = express.Router();
const { Profile } = require('../Schema/Schema');
const { authenticate } = require('./authenticate');

router.put('/profile/:id/update-bio', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { bio } = req.body;

    if (String(id) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (typeof bio !== 'string' || bio.length > 2000) {
      return res.status(400).json({ message: 'Invalid bio' });
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: id },
      { bio },
      { new: true }
    );

    if (!updatedProfile) return res.status(404).json({ message: 'Profile not found' });
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating bio:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
