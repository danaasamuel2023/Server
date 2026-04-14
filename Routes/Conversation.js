const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Conversation, Message } = require('../Schema/Schema');
const { authenticate } = require('./authenticate');

async function isParticipant(conversationId, userId) {
  const convo = await Conversation.findById(conversationId);
  if (!convo) return { ok: false, code: 404 };
  const participants = (convo.participants || convo.members || []).map(String);
  if (participants.length && !participants.includes(String(userId)))
    return { ok: false, code: 403 };
  return { ok: true, convo };
}

router.post('/', authenticate, async (req, res) => {
  try {
    const { participants, product } = req.body;
    if (!Array.isArray(participants) || participants.length === 0)
      return res.status(400).json({ message: 'participants required' });
    for (const p of participants)
      if (!mongoose.Types.ObjectId.isValid(p))
        return res.status(400).json({ message: 'Invalid participant ID' });

    // Requester must be one of the participants
    if (!participants.map(String).includes(String(req.user._id)))
      return res.status(403).json({ message: 'Forbidden' });

    const conversation = new Conversation({ participants, product });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:conversationId/messages', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { recipientId, text } = req.body;
    const senderId = req.user._id;

    if (
      !mongoose.Types.ObjectId.isValid(conversationId) ||
      !mongoose.Types.ObjectId.isValid(recipientId)
    )
      return res.status(400).json({ message: 'Invalid IDs' });
    if (typeof text !== 'string' || !text.trim() || text.length > 5000)
      return res.status(400).json({ message: 'Invalid message' });

    const check = await isParticipant(conversationId, senderId);
    if (!check.ok) return res.status(check.code).json({ message: check.code === 403 ? 'Forbidden' : 'Not found' });

    const message = new Message({
      conversationId,
      senderId,
      recipientId,
      text: text.trim(),
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:conversationId/messages', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(conversationId))
      return res.status(400).json({ message: 'Invalid ID' });

    const check = await isParticipant(conversationId, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.code === 403 ? 'Forbidden' : 'Not found' });

    const messages = await Message.find({ conversationId }).sort('createdAt');
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
