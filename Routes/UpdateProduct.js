const express = require('express');
const router = express.Router();
const { Product, School } = require('../Schema/Schema'); 

router.put('/:id', upload.single('filePath'), async (req, res) => {
    try {
      const { name, description, price, category, schoolId } = req.body;
      const updateData = { name, description, price, category, school: schoolId };
      
      if (req.file) {
        updateData.filePath = req.file.path;
      }
  
      const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error });
    }
  });
  module.exports = router;