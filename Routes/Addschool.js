const express = require('express');
const router = express.Router();
const { School } = require('../Schema/Schema'); // Import the School model

// Route to add new schools
router.post('/addschools', async (req, res) => {
  const schools = req.body;

  if (!Array.isArray(schools) || schools.length === 0) {
    return res.status(400).json({ message: 'An array of schools is required' });
  }

  try {
    const addedSchools = await School.insertMany(schools);
    res.status(201).json({ message: 'Schools added successfully', schools: addedSchools });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
