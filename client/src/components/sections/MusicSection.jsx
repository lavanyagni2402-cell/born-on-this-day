import React from 'react';
import './sections.css';

function youtubeSearchUrl(song) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`;
}

function MusicSection({ music, year }) {
  return (
    <div className="card-topper">
      <div className="section-label">on the charts</div>
      <div className="card music-card">
        <h2 className="music-heading">The Sounds of {year}</h2>
        {music.note && <p className="music-note">★ {music.note}</p>}

        <div className="music-genre-tag">{music.genre}</div>

        <a
          className="music-number1"
          href={youtubeSearchUrl(music.number1)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="number1-badge">
            <span>#1</span>
          </div>
          <div className="number1-info">
            <p className="number1-label">number one song</p>
            <h3 className="number1-title">{music.number1}</h3>
          </div>
          <span className="music-vinyl">▶</span>
        </a>

        <div className="music-top5">
          <p className="top5-label">top 5 of the year</p>
          {music.top5?.map((song, i) => (
            <a
              key={i}
              className="top5-row"
              href={youtubeSearchUrl(song)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="top5-num">{i + 1}</span>
              <span className="top5-song">{song}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MusicSection;
