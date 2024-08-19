const express = require('express');
const router = express.Router();
const { Product } = require('../Schema/Schema');

// Add Rating
router.post('/product/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body; // Expect rating value between 1 and 5

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).send('Invalid rating value');
    }

    // Find the product and update the rating
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Update average rating
    const totalRating = product.averageRating * product.ratingCount;
    product.ratingCount += 1;
    product.averageRating = (totalRating + rating) / product.ratingCount;

    await product.save();
    res.status(200).json({ averageRating: product.averageRating, ratingCount: product.ratingCount });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Fetch User Rating
router.get('/product/:id/rating', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    res.json({
      averageRating: product.averageRating,
      ratingCount: product.ratingCount
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
});


module.exports = router;
