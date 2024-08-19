const express = require('express');
const router = express.Router();
const { School } = require('../Schema/Schema'); // Import the School model

// Route to get all schools
router.get('/all-schools', async (req, res) => {
  try {
    const schools = await School.find();
    res.status(200).json(schools);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
