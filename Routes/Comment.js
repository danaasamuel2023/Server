const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Comment, Product } = require('../Schema/Schema');
const { authenticate } = require('./authenticate');

router.get('/:itemId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.itemId))
      return res.status(400).json({ message: 'Invalid ID' });
    const comments = await Comment.find({ itemId: req.params.itemId })
      .populate('userId', 'username school')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { itemId, comment } = req.body;
  const userId = req.user._id;

  try {
    if (!mongoose.Types.ObjectId.isValid(itemId))
      return res.status(400).json({ message: 'Invalid item ID' });
    if (typeof comment !== 'string' || !comment.trim() || comment.length > 2000)
      return res.status(400).json({ message: 'Invalid comment' });

    const item = await Product.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const isSeller = item.seller.toString() === String(userId);

    const newComment = new Comment({
      itemId,
      userId,
      comment: comment.trim(),
      isSeller,
    });

    const savedComment = await newComment.save();
    const populatedComment = await Comment.findById(savedComment._id).populate(
      'userId',
      'username school'
    );
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

module.exports = router;
