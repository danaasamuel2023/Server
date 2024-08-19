// server/routes/productRoutes.js

const express = require('express');
const router = express.Router();
const { Product } = require('../Schema/Schema');

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product by ID and delete it
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
