import React from 'react';
import './sections.css';

function EarthquakeSection({ earthquakes }) {
  if (!earthquakes || earthquakes.length === 0) return null;

  return (
    <div className="card-topper">
      <div className="section-label">earth events</div>
      <div className="card earthquake-card">
        <div className="earthquake-list">
          {earthquakes.map((eq, i) => (
            <a
              key={i}
              className="earthquake-row"
              href={eq.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="earthquake-mag">M{eq.magnitude}</span>
              <span className="earthquake-place">{eq.place}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EarthquakeSection;
