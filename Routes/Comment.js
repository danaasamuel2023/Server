const express = require('express');
const router = express.Router();
const { Comment, Product, User } = require('../Schema/Schema');

// GET comments for a specific item (most recent first)
router.get('/:itemId', async (req, res) => {
  try {
    const comments = await Comment.find({ itemId: req.params.itemId })
      .populate('userId', 'username school')
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// POST a new comment
router.post('/', async (req, res) => {
  const { itemId, userId, comment } = req.body;

  try {
    const item = await Product.findById(itemId);
    if (!item) {
      console.error(`Item not found for ID: ${itemId}`);
      return res.status(404).json({ message: 'Item not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found for ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const isSeller = item.seller.toString() === userId;

    const newComment = new Comment({
      itemId,
      userId,
      comment,
      isSeller,
    });

    const savedComment = await newComment.save();
    const populatedComment = await Comment.findById(savedComment._id).populate('userId', 'username school');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

module.exports = router;
