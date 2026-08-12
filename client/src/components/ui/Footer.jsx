import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer">
      <div className="scallop-divider footer-scallop" aria-hidden="true"></div>

      <div className="container footer-inner">
        <div className="footer-col">
          <div className="footer-brand">
            <span className="footer-star">★</span>
            <span className="footer-name">born on this day</span>
          </div>
          <p className="footer-copy">
            A journey through time — exploring the world as it was on the day you arrived.
          </p>
        </div>

        <div className="footer-col footer-col-right">
          <p className="footer-meta">
            Wikipedia, TMDB, NASA, USGS &amp; 10 more open data sources
            <br />
            Built with MERN stack
          </p>
          <button type="button" className="footer-top-btn" onClick={scrollToTop}>
            back to top ↑
          </button>
        </div>
      </div>

      <div className="footer-mega-wrap">
        <div className="footer-mega" aria-hidden="true">born.</div>
      </div>
    </footer>
  );
}

export default Footer;