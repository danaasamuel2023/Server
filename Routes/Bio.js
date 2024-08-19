const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const { Profile } = require('../Schema/Schema');
const app = express()
app.put('/profile/:id/update-bio', async (req, res) => {
    try {
      const { id } = req.params;
      const { bio } = req.body;
  
      const updatedProfile = await Profile.findOneAndUpdate(
        { user: id },
        { bio },
        { new: true }
      );
  
      if (!updatedProfile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
  
      res.json(updatedProfile);
    } catch (error) {
      console.error('Error updating bio:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  module.exports = router