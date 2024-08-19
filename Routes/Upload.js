const express = require('express');
const router = express.Router();
const { Product, User, School } = require('../Schema/Schema'); // Import the models
const upload = require('../Upload_logic/Upload'); // Import multer 

router.post('/createPost', upload.single('filePath'), async (req, res) => {
  try {
    const { name, description, price, seller, category, school, phoneNumber } = req.body;

    // Validate if seller exists
    const userExists = await User.findById(seller).populate('school');
    if (!userExists) {
      return res.status(400).json({ message: 'Invalid seller ID' });
    }

    // Validate school
    const schoolExists = await School.findById(school);
    if (!schoolExists) {
      return res.status(400).json({ message: 'Invalid school ID' });
    }

    // Create product
    const product = new Product({
      name,
      description,
      price,
      seller,
      category,
      school,
      phoneNumber,
      filePath: req.file.path // Store file path
    });

    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
