const express = require('express');
const router = express.Router();
const { Product, School } = require('../Schema/Schema'); // Import the models

router.get('/school/:schoolId', async (req, res) => {
    try {
      const products = await Product.find({ school: req.params.schoolId }).populate('seller', 'username email').populate('school', 'name location');
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error });
    }
  });
  module.exports = router;