import React from 'react';
import './sections.css';

function MusicSection({ music, year }) {
  return (
    <div className="card music-card">
      <div className="section-label">on the charts</div>
      <h2 className="music-heading">The Sounds of {year}</h2>
      {music.note && <p className="music-note">★ {music.note}</p>}

      <div className="music-genre-tag">{music.genre}</div>

      <div className="music-number1">
        <div className="number1-badge">
          <span>#1</span>
        </div>
        <div className="number1-info">
          <p className="number1-label">number one song</p>
          <h3 className="number1-title">{music.number1}</h3>
        </div>
        <span className="music-vinyl">🎵</span>
      </div>

      <div className="music-top5">
        <p className="top5-label">top 5 of the year</p>
        {music.top5?.map((song, i) => (
          <div key={i} className="top5-row">
            <span className="top5-num">{i + 1}</span>
            <span className="top5-song">{song}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MusicSection;