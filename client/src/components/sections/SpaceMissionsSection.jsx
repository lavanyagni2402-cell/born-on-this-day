import React from 'react';
import './sections.css';

function SpaceMissionsSection({ missions }) {
  if (!missions || missions.length === 0) return null;

  return (
    <div className="section-block">
      <div className="section-label">reaching orbit</div>
      <h2 className="section-title">Space Missions That Day</h2>

      <div className="movies-grid">
        {missions.map((mission, i) => (
          <a
            key={i}
            className="movie-card"
            href={mission.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {mission.image ? (
              <div className="movie-poster-wrapper">
                <img src={mission.image} alt={mission.name} className="movie-poster" onError={e => e.target.parentElement.style.display = 'none'} />
                {mission.status && (
                  <span className="card-sticker">🚀 {mission.status}</span>
                )}
              </div>
            ) : (
              <div className="movie-poster-placeholder">
                <span className="movie-poster-icon">🚀</span>
              </div>
            )}
            <div className="movie-info">
              <h4 className="movie-title">{mission.name}</h4>
              {mission.provider && <span className="movie-rating">{mission.provider}</span>}
              {mission.rocket && <p className="movie-overview">{mission.rocket}</p>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default SpaceMissionsSection;
