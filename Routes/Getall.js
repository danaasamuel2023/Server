const express = require('express');
const router = express.Router();
const {Product} = require('../Schema/Schema'); // Adjust the path as needed

router.get('/getall', async (req, res) => {
  try {
    const { schoolId } = req.query;

    // Ensure schoolId is correctly used for filtering
    const filter = schoolId ? { school: schoolId } : {};

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
