import React from 'react';
import './ProgressBar.css';

function ProgressBar({ total, current }) {
  return (
    <div className="story-progress" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="story-progress-track">
          <div
            className="story-progress-fill"
            style={{ width: i <= current ? '100%' : '0%' }}
          />
        </div>
      ))}
    </div>
  );
}

export default ProgressBar;
