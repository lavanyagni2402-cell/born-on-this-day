const mongoose = require('mongoose');

const CapsuleSchema = new mongoose.Schema({
  shareId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  birthDate: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'Anonymous'
  },
  capsuleData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 365 // Auto-delete after 1 year
  }
});

module.exports = mongoose.model('Capsule', CapsuleSchema);