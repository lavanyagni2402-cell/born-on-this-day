import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-star">★</span>
          <span className="footer-name">born on this day</span>
        </div>
        <p className="footer-copy">
          A journey through time — exploring the world as it was on the day you arrived.
        </p>
        <p className="footer-meta">
          Data from Wikipedia, TMDB, NewsAPI & open sources.
          Built with MERN stack.
        </p>
      </div>
    </footer>
  );
}

export default Footer;