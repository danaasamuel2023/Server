const express = require('express');
const router = express.Router();
const { Product } = require('../Schema/Schema');

// Add this to your product routes
router.put('/product/:productId/toggle-comments', async (req, res) => {
  const { productId } = req.params;
  try {
      const product = await Product.findById(productId);
      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }
      
      product.commentsEnabled = !product.commentsEnabled;
      await product.save();
      res.json(product);
  } catch (error) {
      console.error('Error toggling comments:', error); // Log the error
      res.status(500).json({ message: 'Error toggling comments', error: error.message });
  }
});

  
module.exports = router;
