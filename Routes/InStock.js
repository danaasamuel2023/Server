const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Product } = require('../Schema/Schema');
const { authenticate } = require('./authenticate');

router.patch('/:id/stock', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { inStock } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid ID' });

    const existing = await Product.findById(id);
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    const isOwner = existing.seller && String(existing.seller) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

    existing.inStock = Boolean(inStock);
    await existing.save();
    res.json(existing);
  } catch (error) {
    console.error('InStock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
