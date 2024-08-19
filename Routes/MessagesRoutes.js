// routes/MessagesRoutes.js
const express = require('express');
const router = express.Router();
const {Message} = require('../Schema/Schema');
const {Conversation} = require('../Schema/Schema');

// Send a message
router.post('/send', async (req, res) => {
  const { senderId, recipientId, text, conversationId } = req.body;

  const newMessage = new Message({
    senderId,
    recipientId,
    text,
    conversationId,
    timestamp: new Date()
  });

  try {
    const savedMessage = await newMessage.save();

    // Update the last message in the conversation
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: savedMessage._id });

    res.status(200).json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
