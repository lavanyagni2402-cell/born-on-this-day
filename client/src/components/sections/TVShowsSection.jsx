import React from 'react';
import './sections.css';

function TVShowsSection({ shows, year }) {
  return (
    <div className="section-block">
      <div className="section-label">on the small screen</div>
      <h2 className="section-title">Popular TV Shows — {year}</h2>

      <div className="movies-grid">
        {shows.map((show, i) => (
          <div key={i} className="movie-card">
            {show.poster ? (
              <div className="movie-poster-wrapper">
                <img src={show.poster} alt={show.title} className="movie-poster" onError={e => e.target.parentElement.style.display = 'none'} />
                {show.rating && (
                  <span className="card-sticker">★ {show.rating}</span>
                )}
              </div>
            ) : (
              <div className="movie-poster-placeholder">
                <span className="movie-poster-initial">{show.title?.[0] || '📺'}</span>
                <span className="movie-poster-icon">📺</span>
              </div>
            )}
            <div className="movie-info">
              <h4 className="movie-title">{show.title}</h4>
              <p className="movie-overview">{show.overview}</p>
              {show.firstAirDate && (
                <span className="movie-year">{show.firstAirDate.slice(0, 4)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TVShowsSection;
