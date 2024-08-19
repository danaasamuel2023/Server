const express = require('express');
const router = express.Router();
const { Product, School } = require('../Schema/Schema'); // Import the models

// Get all products based on school name
router.get('/items/:schoolName', async (req, res) => {
  try {
    const { schoolName } = req.params;

    // Find the school by name
    const school = await School.findOne({ name: schoolName });
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Find all products related to the found school
    const products = await Product.find({ school: school._id }).populate('seller').populate('school');

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
