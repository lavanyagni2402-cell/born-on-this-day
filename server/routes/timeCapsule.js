const express = require('express');
const router = express.Router();
const { getCapsuleData } = require('../controllers/capsuleController');

// GET /api/capsule/:date — main data endpoint
router.get('/:date', async (req, res) => {
  const { date } = req.params;

  // Validate date format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  const [year, month, day] = date.split('-').map(Number);

  if (year < 1900 || year > new Date().getFullYear()) {
    return res.status(400).json({ error: 'Date must be between 1900 and today' });
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return res.status(400).json({ error: 'Invalid date values' });
  }

  try {
    const data = await getCapsuleData(date);
    res.json(data);
  } catch (err) {
    console.error('Capsule generation error:', err);
    res.status(500).json({ error: 'Failed to generate time capsule' });
  }
});

module.exports = router;