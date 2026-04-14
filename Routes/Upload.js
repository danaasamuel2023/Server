const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Product, User, School } = require('../Schema/Schema');
const upload = require('../Upload_logic/Upload');
const { authenticate } = require('./authenticate');

router.post('/createPost', authenticate, upload.single('filePath'), async (req, res) => {
  try {
    const { name, description, price, category, school, phoneNumber } = req.body;
    // Seller is ALWAYS the authenticated user — never trust the request body.
    const seller = req.user._id;

    if (!req.file) return res.status(400).json({ message: 'Image file is required' });
    if (!name || !price) return res.status(400).json({ message: 'Missing required fields' });

    const userExists = await User.findById(seller).populate('school');
    if (!userExists) return res.status(400).json({ message: 'Invalid seller' });

    if (!mongoose.Types.ObjectId.isValid(school))
      return res.status(400).json({ message: 'Invalid school ID' });
    const schoolExists = await School.findById(school);
    if (!schoolExists) return res.status(400).json({ message: 'Invalid school ID' });

    const product = new Product({
      name,
      description,
      price,
      seller,
      category,
      school,
      phoneNumber,
      filePath: req.file.path,
    });

    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
