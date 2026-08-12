import React from 'react';
import './sections.css';

function GamesSection({ games, year }) {
  const hasData = games && games.length > 0;

  return (
    <div className="section-block">
      <div className="section-label">leveling up</div>
      <h2 className="section-title">Trending Games — {year}</h2>

      {!hasData ? (
        <div className="card section-empty-card">
          <p className="section-empty-text">No trending games data available for this date.</p>
        </div>
      ) : (
        <div className="movies-grid">
          {games.map((game, i) => (
            <a
              key={i}
              className="movie-card"
              href={game.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {game.cover ? (
                <div className="movie-poster-wrapper">
                  <img src={game.cover} alt={game.title} className="movie-poster" onError={e => e.target.parentElement.style.display = 'none'} />
                  {game.rating && (
                    <span className="card-sticker">★ {game.rating}</span>
                  )}
                </div>
              ) : (
                <div className="movie-poster-placeholder">
                  <span className="movie-poster-initial">{game.title?.[0] || '🎮'}</span>
                  <span className="movie-poster-icon">🎮</span>
                </div>
              )}
              <div className="movie-info">
                <h4 className="movie-title">{game.title}</h4>
                {game.genre && <span className="movie-rating">{game.genre}</span>}
                {game.releaseDate && (
                  <span className="movie-year">{game.releaseDate.slice(0, 4)}</span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default GamesSection;
