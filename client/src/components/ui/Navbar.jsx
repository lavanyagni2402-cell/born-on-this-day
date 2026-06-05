import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <span className="logo-star">★</span>
          <span className="logo-text">born<span className="logo-accent">.</span>on<span className="logo-accent">.</span>this<span className="logo-accent">.</span>day</span>
        </Link>

        <div className="navbar-right">
          <span className="navbar-tagline">your personal time capsule</span>
          {location.pathname !== '/' && (
            <Link to="/" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '11px' }}>
              ← new date
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;