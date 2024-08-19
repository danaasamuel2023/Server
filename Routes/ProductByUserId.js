const express = require('express');
const router = express.Router();
const { Product } = require('../Schema/Schema'); // Adjust the path as necessary

// Route to get products by user ID
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const products = await Product.find({ seller: userId }).populate('school').populate('seller');
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products by user ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
