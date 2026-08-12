import React from 'react';
import { motion } from 'framer-motion';
import './LoadingScreen.css';

function LoadingScreen({ message = 'Opening your time capsule…' }) {
  return (
    <div className="story-loading">
      <motion.span
        className="story-loading-star"
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
      >
        ★
      </motion.span>
      <motion.p
        className="story-loading-text"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {message}
      </motion.p>
    </div>
  );
}

export default LoadingScreen;
