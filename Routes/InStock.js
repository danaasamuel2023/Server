const express = require('express');
const router = express.Router();
const { Product } = require('../Schema/Schema');

// Toggle the stock status of a product
router.patch('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { inStock } = req.body;

    // Find the product and update its stock status
    const product = await Product.findByIdAndUpdate(
      id,
      { inStock },
      { new: true }  // Return the updated document
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
99