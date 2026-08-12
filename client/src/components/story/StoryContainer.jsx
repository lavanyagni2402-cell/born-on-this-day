import React, { useCallback, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import StoryCard from './StoryCard';
import './StoryContainer.css';

function StoryContainer({ cards, onComplete }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const navigate = useNavigate();

  const goNext = useCallback(() => {
    setIndex(i => {
      if (i >= cards.length - 1) {
        onComplete();
        return i;
      }
      return i + 1;
    });
  }, [cards.length, onComplete]);

  const goPrev = useCallback(() => {
    setIndex(i => Math.max(0, i - 1));
  }, []);

  const handleClick = (e) => {
    const width = window.innerWidth;
    const x = e.clientX;
    if (x < width * 0.3) {
      goPrev();
    } else {
      goNext();
    }
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'Escape') {
      onComplete();
    }
  }, [goNext, goPrev, onComplete]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 40) return; // ignore taps, handled by onClick
    if (deltaX < 0) goNext();
    else goPrev();
  };

  const current = cards[index];
  if (!current) return null;

  return (
    <div
      className="story-container"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ProgressBar total={cards.length} current={index} />

      <button
        type="button"
        className="story-skip"
        onClick={(e) => { e.stopPropagation(); onComplete(); }}
      >
        Skip →
      </button>

      <button
        type="button"
        className="story-exit"
        onClick={(e) => { e.stopPropagation(); navigate('/'); }}
        aria-label="Close"
      >
        ✕
      </button>

      <AnimatePresence mode="wait">
        <StoryCard
          key={current.id}
          card={current}
          isFinal={!!current.isFinal}
          onFinalClick={(e) => { e.stopPropagation(); onComplete(); }}
        />
      </AnimatePresence>
    </div>
  );
}

export default StoryContainer;
