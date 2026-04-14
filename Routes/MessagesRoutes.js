const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Message, Conversation } = require('../Schema/Schema');
const { authenticate } = require('./authenticate');

router.post('/send', authenticate, async (req, res) => {
  try {
    const { recipientId, text, conversationId } = req.body;
    const senderId = req.user._id;

    if (
      !mongoose.Types.ObjectId.isValid(recipientId) ||
      !mongoose.Types.ObjectId.isValid(conversationId)
    )
      return res.status(400).json({ message: 'Invalid IDs' });
    if (typeof text !== 'string' || !text.trim() || text.length > 5000)
      return res.status(400).json({ message: 'Invalid message' });

    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });
    // Ensure sender is a participant (schema-dependent: try common fields)
    const participants = convo.participants || convo.members || [];
    if (
      participants.length &&
      !participants.map(String).includes(String(senderId))
    )
      return res.status(403).json({ message: 'Forbidden' });

    const newMessage = new Message({
      senderId,
      recipientId,
      text: text.trim(),
      conversationId,
      timestamp: new Date(),
    });

    const savedMessage = await newMessage.save();
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: savedMessage._id });
    res.status(200).json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

module.exports = router;
