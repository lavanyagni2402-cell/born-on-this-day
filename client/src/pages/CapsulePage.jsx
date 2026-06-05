import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Loader from '../components/ui/Loader';
import MoonSection from '../components/sections/MoonSection';
import NewsSection from '../components/sections/NewsSection';
import MusicSection from '../components/sections/MusicSection';
import MoviesSection from '../components/sections/MoviesSection';
import BirthdaysSection from '../components/sections/FamousBirthdaysSection';
import HistorySection from '../components/sections/HistorySection';
import PopulationSection from '../components/sections/PopulationSection';
import TechSection from '../components/sections/TechEraSection';
import ShareSection from '../components/sections/ShareSection';
import { fetchCapsule } from '../utils/api';
import './CapsulePage.css';

function CapsulePage() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const capsuleRef = useRef(null);

  const name = sessionStorage.getItem('capsuleName') || '';

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchCapsule(date)
      .then(d => { setData(d); setLoading(false); })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load your time capsule. Please try again.');
        setLoading(false);
      });
  }, [date]);

  if (loading) return (
    <div className="capsule-page">
      <div className="container">
        <Loader />
      </div>
    </div>
  );

  if (error) return (
    <div className="capsule-page">
      <div className="container error-state">
        <span className="error-icon">★</span>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>← Try Again</button>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <>
      <Helmet>
        <title>Time Capsule: {data.date.full} — Born On This Day</title>
        <meta name="description" content={`Discover what the world was like on ${data.date.full}. Headlines, music, movies, moon phase and more.`} />
      </Helmet>

      <div className="capsule-page" ref={capsuleRef}>
        {/* ── Masthead ──────────────────────────────────────────────── */}
        <header className="capsule-masthead">
          <div className="masthead-noise"></div>
          <div className="container masthead-inner">

            <div className="masthead-top">
              <span className="masthead-tag tag">★ time capsule</span>
              <span className="masthead-tag tag">{data.date.season.emoji} {data.date.season.name}</span>
            </div>

            <div className="masthead-headline">
              {name && (
                <p className="masthead-name">
                  <span className="serif-italic">welcome,</span> {name}
                </p>
              )}
              <h1 className="masthead-title">
                <span className="masthead-born">born on</span>
                <span className="masthead-date-big">{data.date.dayOfWeek}</span>
                <span className="masthead-date-line">
                  <span className="date-day">{data.date.day}</span>
                  <span className="date-sep">/</span>
                  <span className="date-month">{MONTHS[data.date.month - 1]}</span>
                  <span className="date-sep">/</span>
                  <span className="date-year">{data.date.year}</span>
                </span>
              </h1>
            </div>

            <div className="masthead-bottom">
              <div className="masthead-moon-preview">
                <span className="moon-emoji">{data.moon.emoji}</span>
                <span className="moon-name">{data.moon.phase}</span>
              </div>
              <p className="masthead-population">
                Population: <strong>{data.population.formatted}</strong>
              </p>
            </div>

          </div>
        </header>

        {/* ── Main content ──────────────────────────────────────────── */}
        <div className="container capsule-grid">

          {/* Left column — News & Music */}
          <div className="capsule-col-main">
            {data.news?.length > 0 && <NewsSection news={data.news} year={data.date.year} />}
            {data.music && <MusicSection music={data.music} year={data.date.year} />}
            {data.wikipedia?.events?.length > 0 && <HistorySection events={data.wikipedia.events} month={data.date.month} day={data.date.day} />}
          </div>

          {/* Right column — sidebar style */}
          <div className="capsule-col-side">
            <MoonSection moon={data.moon} />
            <PopulationSection population={data.population} year={data.date.year} />
            <TechSection tech={data.techEra} />
            {data.wikipedia?.holidays?.length > 0 && (
              <div className="card holidays-card">
                <div className="section-label">on this day</div>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Observances</h3>
                {data.wikipedia.holidays.map((h, i) => (
                  <p key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>★ {h.text}</p>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Full width sections ───────────────────────────────────── */}
        <div className="container">
          {data.movies?.length > 0 && <MoviesSection movies={data.movies} year={data.date.year} />}
          {data.famousBirthdays?.length > 0 && <BirthdaysSection birthdays={data.famousBirthdays} />}
          <ShareSection date={date} name={name} />
        </div>

      </div>
    </>
  );
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default CapsulePage;