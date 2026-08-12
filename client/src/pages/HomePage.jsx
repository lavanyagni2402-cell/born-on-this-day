import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './HomePage.css';

function HomePage() {
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const formCardRef = useRef(null);

  const handleFormCardMouseMove = (e) => {
    const card = formCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--glow-x', `${x}%`);
    card.style.setProperty('--glow-y', `${y}%`);
  };

  const today = new Date().toISOString().split('T')[0];
  const minDate = '1900-01-01';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!date) {
      setError('Please enter your birth date.');
      return;
    }

    const selected = new Date(date);
    const now = new Date();
    if (selected > now) {
      setError('Date cannot be in the future.');
      return;
    }

    // Store name in sessionStorage for use on capsule page
    if (name) sessionStorage.setItem('capsuleName', name);

    navigate(`/story/${date}`);
  };

  return (
    <>
      <Helmet>
        <title>Born On This Day — Your Personal Time Capsule</title>
      </Helmet>

      <div className="home-page">
        {/* Scattered star decorations */}
        <div className="star-field">
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              className="star-dot"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                fontSize: `${8 + Math.random() * 12}px`,
                opacity: 0.1 + Math.random() * 0.3
              }}
            >★</span>
          ))}
        </div>

        {/* Hero */}
        <section className="hero">
          <div className="container hero-inner">

            {/* Left editorial block */}
            <div className="hero-text">
              <div className="hero-eyebrow">
                <span className="tag">★ time capsule</span>
              </div>

              <h1 className="hero-headline">
                <span className="hero-line-small">what was the</span>
                <span className="hero-line-big">WORLD</span>
                <span className="hero-line-mid">like when</span>
                <span className="hero-line-big accent-text">you</span>
                <span className="hero-line-small">were born?</span>
              </h1>

              <p className="hero-description">
                Enter your birth date and step back in time.
                Discover the headlines, music, movies, moon phase,
                and the cultural moment you arrived into.
              </p>

              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">100+</span>
                  <span className="stat-label">years of history</span>
                </div>
                <div className="stat-divider">★</div>
                <div className="stat-item">
                  <span className="stat-number">14</span>
                  <span className="stat-label">data sources</span>
                </div>
                <div className="stat-divider">★</div>
                <div className="stat-item">
                  <span className="stat-number">∞</span>
                  <span className="stat-label">shareable</span>
                </div>
              </div>
            </div>

            {/* Right — date picker card */}
            <div className="hero-form-wrapper">
              <div className="form-card" ref={formCardRef} onMouseMove={handleFormCardMouseMove}>
                <div className="form-card-header">
                  <span className="form-card-star">★</span>
                  <span className="form-card-title">open your capsule</span>
                </div>

                <form onSubmit={handleSubmit} className="date-form">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">your name (optional)</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="form-input"
                      maxLength={50}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="date" className="form-label">your birth date *</label>
                    <input
                      id="date"
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      min={minDate}
                      max={today}
                      className="form-input date-input"
                      required
                    />
                  </div>

                  {error && <p className="form-error">⚠ {error}</p>}

                  <button type="submit" className="btn btn-primary form-submit">
                    <span>★</span>
                    <span>open my time capsule</span>
                  </button>
                </form>

                <div className="form-examples">
                  <p className="examples-label">try a famous date:</p>
                  <div className="examples-list">
                    {[
                      { date: '1969-07-20', label: 'Moon Landing' },
                      { date: '1989-11-09', label: 'Berlin Wall Falls' },
                      { date: '2001-09-11', label: 'September 11' },
                      { date: '1977-05-25', label: 'Star Wars Premiere' },
                    ].map(ex => (
                      <button
                        key={ex.date}
                        className="example-btn"
                        onClick={() => { setDate(ex.date); setName(''); }}
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="scallop-divider" aria-hidden="true"></div>

        {/* Feature grid */}
        <section className="features container">
          <div className="features-header">
            <div className="section-label">what's inside</div>
            <h2 className="section-title"></h2>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <h3 className="feature-name">{f.name}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

const FEATURES = [
  { icon: '📰', name: 'News Headlines', desc: 'Major stories from that exact day — politics, culture, science' },
  { icon: '🎵', name: 'Music Charts', desc: 'The #1 song and top hits from your birth week' },
  { icon: '🎬', name: 'Movies in Theaters', desc: 'What was playing on the big screen that month' },
  { icon: '📺', name: 'TV Shows', desc: 'Popular shows airing around your birth year' },
  { icon: '📖', name: 'Books Released', desc: 'Notable books published that year' },
  { icon: '🎮', name: 'Trending Games', desc: 'Games that were popular around that time' },
  { icon: '🌕', name: 'Moon Phase', desc: 'The exact lunar phase the night you were born' },
  { icon: '👥', name: 'World Population', desc: 'How many people shared the planet with you' },
  { icon: '💻', name: 'Tech Era', desc: 'The technology and gadgets defining the moment' },
  { icon: '🌤️', name: 'Weather Snapshot', desc: 'The exact temperature, rainfall and wind for that day' },
  { icon: '📈', name: 'Stock Markets', desc: 'Where the Dow, NASDAQ and S&P 500 closed that day' },
  { icon: '💱', name: 'Currency Snapshot', desc: 'What $1 USD was worth in EUR, GBP, INR and JPY' },
  { icon: '🌋', name: 'Earth Events', desc: 'Notable earthquakes recorded around the world that day' },
  { icon: '🚀', name: 'NASA Picture of the Day', desc: 'The astronomy image NASA featured that day' },
  { icon: '🛰️', name: 'Space Missions', desc: 'Rockets and launches happening around that day' },
  { icon: '🔬', name: 'Science Highlights', desc: 'The most-cited research published that year' },
  { icon: '🕸️', name: 'The Internet as It Looked', desc: 'Wayback Machine snapshots of major sites from that era' },
  { icon: '📷', name: 'Photos From the Era', desc: 'A visual look back at the period you were born' },
  { icon: '🎂', name: 'Famous Birthdays', desc: 'Notable people who share your exact birth date' },
  { icon: '📅', name: 'Historical Events', desc: 'Pivotal moments from history on this day' },
  { icon: '🔗', name: 'Share Your Capsule', desc: 'Get a unique link to share with friends & family' },
];

export default HomePage;