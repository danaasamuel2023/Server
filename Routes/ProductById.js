const express = require('express');
const router = express.Router();
const { Product, School } = require('../Schema/Schema'); // Import the models

router.get('/item/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('school', 'name location');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
