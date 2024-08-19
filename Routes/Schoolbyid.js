const express = require('express');
const router = express.Router();
const { School } = require('../Schema/Schema'); // Adjust the path if necessary

// Route to get a school by its ID
router.get('/user/school/:id', async (req, res) => {
  try {
    const schoolId = req.params.id.trim(); // Ensure the ID is trimmed
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.json(school);
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
