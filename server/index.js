const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const timeCapsuleRoutes = require('./routes/timeCapsule');
const shareRoutes = require('./routes/share');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Routes
app.use('/api/capsule', timeCapsuleRoutes);
app.use('/api/share', shareRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timecapsule')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('⚠️  MongoDB not connected (running without DB):', err.message));

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});