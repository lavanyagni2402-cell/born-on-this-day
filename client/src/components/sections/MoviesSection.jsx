import React from 'react';
import './sections.css';

function MoviesSection({ movies, year }) {
  return (
    <div className="section-block">
      <div className="section-label">at the cinema</div>
      <h2 className="section-title">Movies in Theaters — {year}</h2>

      <div className="movies-grid">
        {movies.map((movie, i) => (
          <div key={i} className="movie-card">
            {movie.poster ? (
              <div className="movie-poster-wrapper">
                <img src={movie.poster} alt={movie.title} className="movie-poster" onError={e => e.target.parentElement.style.display='none'} />
                {movie.rating && movie.rating !== 'N/A' && (
                  <span className="card-sticker">★ {movie.rating}</span>
                )}
              </div>
            ) : (
              <div className="movie-poster-placeholder">
                <span className="movie-poster-initial">{movie.title?.[0] || '🎬'}</span>
                <span className="movie-poster-icon">🎬</span>
              </div>
            )}
            <div className="movie-info">
              <h4 className="movie-title">{movie.title}</h4>
              <p className="movie-overview">{movie.overview}</p>
              {movie.releaseDate && (
                <span className="movie-year">{movie.releaseDate.slice(0, 4)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MoviesSection;