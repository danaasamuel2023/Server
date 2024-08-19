// routes/conversations.js
const express = require('express');
const router = express.Router();
const { Conversation, Message } = require('../Schema/Schema');

// Create a new conversation
router.post('/', async (req, res) => {
  const { participants, product } = req.body;
  try {
    const conversation = new Conversation({ participants, product });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send a message
router.post('/:conversationId/messages', async (req, res) => {
  const { conversationId } = req.params;
  const { senderId, recipientId, text } = req.body;
  try {
    if (!conversationId || !senderId || !recipientId || !text) {
      throw new Error('Missing required fields: conversationId, senderId, recipientId, and text are all required');
    }
    const message = new Message({ conversationId, senderId, recipientId, text });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a conversation
router.get('/:conversationId/messages', async (req, res) => {
  const { conversationId } = req.params;
  try {
    const messages = await Message.find({ conversationId }).sort('createdAt');
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
