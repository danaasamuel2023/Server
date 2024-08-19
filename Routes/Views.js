const express = require('express');
const router = express.Router();
const {Product} = require('../Schema/Schema');

// Increment product views
router.post('/product/:id/view', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.status(200).send('View incremented');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Increment product clicks
router.post('/product/:id/click', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.status(200).send('Click incremented');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
