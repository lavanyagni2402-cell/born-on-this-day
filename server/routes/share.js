const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getCapsuleData } = require('../controllers/capsuleController');

// In-memory store (fallback when MongoDB isn't connected)
const memoryStore = new Map();

function generateShareId() {
  return crypto.randomBytes(6).toString('base64url');
}

// POST /api/share — save a capsule and return share ID
router.post('/', async (req, res) => {
  const { birthDate, name } = req.body;

  if (!birthDate) {
    return res.status(400).json({ error: 'birthDate is required' });
  }

  try {
    const capsuleData = await getCapsuleData(birthDate);
    const shareId = generateShareId();

    // Try MongoDB first
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        const Capsule = require('../models/Capsule');
        await Capsule.create({
          shareId,
          birthDate,
          name: name || 'Anonymous',
          capsuleData
        });
      } else {
        throw new Error('MongoDB not connected');
      }
    } catch (dbErr) {
      // Fall back to memory store
      memoryStore.set(shareId, { birthDate, name, capsuleData, createdAt: new Date() });
    }

    res.json({
      shareId,
      shareUrl: `/capsule/${shareId}`,
      message: 'Time capsule saved!'
    });
  } catch (err) {
    console.error('Share error:', err);
    res.status(500).json({ error: 'Failed to save capsule' });
  }
});

// GET /api/share/:shareId — retrieve a saved capsule
router.get('/:shareId', async (req, res) => {
  const { shareId } = req.params;

  try {
    // Try MongoDB first
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        const Capsule = require('../models/Capsule');
        const doc = await Capsule.findOneAndUpdate(
          { shareId },
          { $inc: { views: 1 } },
          { new: true }
        );
        if (doc) {
          return res.json({ name: doc.name, birthDate: doc.birthDate, capsuleData: doc.capsuleData, views: doc.views });
        }
      }
    } catch (dbErr) {}

    // Fallback to memory
    const memDoc = memoryStore.get(shareId);
    if (memDoc) {
      return res.json({ name: memDoc.name, birthDate: memDoc.birthDate, capsuleData: memDoc.capsuleData });
    }

    res.status(404).json({ error: 'Capsule not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve capsule' });
  }
});

module.exports = router;