import React from 'react';
import { motion } from 'framer-motion';
import './StoryCard.css';

const cardVariants = {
  initial: { opacity: 0, scale: 0.96, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2, ease: 'easeIn' } },
};

function StoryCard({ card, isFinal, onFinalClick }) {
  const style = card.image
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(10, 6, 8, 0.25) 0%, rgba(10, 6, 8, 0.75) 100%), url(${card.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  return (
    <motion.div
      className={`story-card story-gradient-${card.gradient ?? 0}`}
      style={style}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="story-card-glass">
        <motion.span
          className="story-card-icon"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          {card.icon}
        </motion.span>

        <motion.p
          className="story-card-eyebrow"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
        >
          {card.eyebrow}
        </motion.p>

        <motion.h2
          className="story-card-value"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
        >
          {card.value}
        </motion.h2>

        {card.sub && (
          <motion.p
            className="story-card-sub"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.4 }}
          >
            {card.sub}
          </motion.p>
        )}

        {isFinal ? (
          <motion.button
            type="button"
            className="story-card-cta"
            onClick={onFinalClick}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            ★ View Full Time Capsule
          </motion.button>
        ) : (
          <motion.p
            className="story-card-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            tap to continue →
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

export default StoryCard;
