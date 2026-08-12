import React from 'react';
import './sections.css';

function BooksSection({ books, year }) {
  return (
    <div className="section-block">
      <div className="section-label">on the shelf</div>
      <h2 className="section-title">Books Released — {year}</h2>

      <div className="movies-grid">
        {books.map((book, i) => (
          <a
            key={i}
            className="movie-card"
            href={book.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {book.cover ? (
              <div className="movie-poster-wrapper">
                <img src={book.cover} alt={book.title} className="movie-poster" onError={e => e.target.parentElement.style.display = 'none'} />
              </div>
            ) : (
              <div className="movie-poster-placeholder">
                <span className="movie-poster-initial">{book.title?.[0] || '📖'}</span>
                <span className="movie-poster-icon">📖</span>
              </div>
            )}
            <div className="movie-info">
              <h4 className="movie-title">{book.title}</h4>
              {book.author && <span className="movie-rating">by {book.author}</span>}
              <p className="movie-overview">{book.description}</p>
              {book.publishedDate && (
                <span className="movie-year">{book.publishedDate.slice(0, 4)}</span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default BooksSection;
