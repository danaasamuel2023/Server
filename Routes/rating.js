const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Product } = require('../Schema/Schema');
const { authenticate } = require('./authenticate');

router.post('/product/:id/rate', authenticate, async (req, res) => {
  try {
    const rating = Number(req.body.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Invalid rating value' });
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid ID' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // TODO: the Product schema does not track per-user ratings, so a user can still
    // rate the same product multiple times. Recommend adding a `ratings` subdocument
    // array of { userId, value } and enforce one-per-user here.
    const totalRating = product.averageRating * product.ratingCount;
    product.ratingCount += 1;
    product.averageRating = (totalRating + rating) / product.ratingCount;

    await product.save();
    res.status(200).json({
      averageRating: product.averageRating,
      ratingCount: product.ratingCount,
    });
  } catch (error) {
    console.error('Rate product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/product/:id/rating', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid ID' });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({
      averageRating: product.averageRating,
      ratingCount: product.ratingCount,
    });
  } catch (error) {
    console.error('Get rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
