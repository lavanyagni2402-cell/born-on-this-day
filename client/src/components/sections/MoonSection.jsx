import React from 'react';
import './sections.css';

function MoonSection({ moon }) {
  return (
    <div className="card-topper">
      <div className="section-label">lunar phase</div>
      <div className="card moon-card">
        <div className="moon-display">
          <span className="moon-big-emoji">{moon.emoji}</span>
          <div className="moon-info">
            <h3 className="moon-phase-name">{moon.phase}</h3>
            <div className="moon-illumination-bar">
              <div
                className="moon-illumination-fill"
                style={{ width: `${moon.illumination}%` }}
              />
            </div>
            <span className="moon-illumination-text">{moon.illumination}% illuminated</span>
          </div>
        </div>
        <p className="moon-description">{moon.description}</p>
      </div>
    </div>
  );
}

export default MoonSection;