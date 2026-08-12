import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Loader from '../components/ui/Loader';
import MoonSection from '../components/sections/MoonSection';
import NewsSection from '../components/sections/NewsSection';
import MusicSection from '../components/sections/MusicSection';
import MoviesSection from '../components/sections/MoviesSection';
import BirthdaysSection from '../components/sections/FamousBirthdaysSection';
import HistorySection from '../components/sections/HistorySection';
import PopulationSection from '../components/sections/PopulationSection';
import NASASection from "../components/sections/NASASection";
import TechSection from '../components/sections/TechEraSection';
import WeatherSection from '../components/sections/WeatherSection';
import StockSection from '../components/sections/StockSection';
import EarthquakeSection from '../components/sections/EarthquakeSection';
import CurrencySection from '../components/sections/CurrencySection';
import ShareSection from '../components/sections/ShareSection';
import { fetchCapsule, getBrowserCoords } from '../utils/api';
import './CapsulePage.css';

// Heavier, image-grid sections are lazy-loaded so the initial capsule paint
// (masthead + main columns) isn't blocked by their bundle weight.
const TVShowsSection = lazy(() => import('../components/sections/TVShowsSection'));
const BooksSection = lazy(() => import('../components/sections/BooksSection'));
const GamesSection = lazy(() => import('../components/sections/GamesSection'));
const PhotosSection = lazy(() => import('../components/sections/PhotosSection'));
const WaybackSection = lazy(() => import('../components/sections/WaybackSection'));
const ScienceSection = lazy(() => import('../components/sections/ScienceSection'));
const SpaceMissionsSection = lazy(() => import('../components/sections/SpaceMissionsSection'));

// Matches the existing card language (no spinner, no layout shift surprises)
// so a lazy chunk loading in doesn't look out of place.
function SectionFallback() {
  return <div className="card" style={{ minHeight: '120px', opacity: 0.4 }} />;
}

function CapsulePage() {
  const { date } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // If we arrived here from the story flow, the capsule data was already
  // fetched once there and handed off via router state — reuse it instead
  // of calling the API again. Direct/shared links (no state) still fetch
  // as before.
  const preloadedData = location.state?.data || null;
  const [data, setData] = useState(preloadedData);
  const [loading, setLoading] = useState(!preloadedData);
  const [error, setError] = useState('');
  const capsuleRef = useRef(null);

  const name = sessionStorage.getItem('capsuleName') || '';

  useEffect(() => {
    if (preloadedData) return;
    setLoading(true);
    setError('');
    getBrowserCoords()
      .then(coords => fetchCapsule(date, coords))
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

        <div className="scallop-divider masthead-scallop" aria-hidden="true"></div>

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
              <div className="card-topper">
                <div className="section-label">on this day</div>
                <div className="card holidays-card">
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Observances</h3>
                  {data.wikipedia.holidays.map((h, i) => (
                    <p key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>★ {h.text}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── Full width sections ───────────────────────────────────── */}
        <div className="container capsule-full-sections">

          {/* Compact stat row — weather/markets/currency/quakes read better
              as an even grid than crammed into the narrow sidebar. */}
          {(data.weather || data.stocks || data.currency || data.earthquakes?.length > 0) && (
            <div className="section-block">
              <div className="section-label">at a glance</div>
              <h2 className="section-title">Quick Facts for That Day</h2>
              <div className="snapshot-grid">
                {data.weather && <WeatherSection weather={data.weather} />}
                {data.stocks && <StockSection stocks={data.stocks} />}
                {data.currency && <CurrencySection currency={data.currency} />}
                {data.earthquakes?.length > 0 && <EarthquakeSection earthquakes={data.earthquakes} />}
              </div>
            </div>
          )}

          {data.nasa && <NASASection nasa={data.nasa} />}
          {data.movies?.length > 0 && <MoviesSection movies={data.movies} year={data.date.year} />}

          <Suspense fallback={<SectionFallback />}>
            {/* Games and Birthdays render unconditionally (not gated on
                `.length > 0`) — each shows its own graceful "no data for
                this date" message internally instead of disappearing, so
                the section is always visually confirmable even when the
                underlying API returned nothing for a given date. */}
            <GamesSection games={data.games} year={data.date.year} />
            <BirthdaysSection birthdays={data.famousBirthdays} />
            {data.tvShows?.length > 0 && <TVShowsSection shows={data.tvShows} year={data.date.year} />}
            {data.books?.length > 0 && <BooksSection books={data.books} year={data.date.year} />}
            {data.photos?.length > 0 && <PhotosSection photos={data.photos} year={data.date.year} />}
            {data.spaceMissions?.length > 0 && <SpaceMissionsSection missions={data.spaceMissions} />}
            {data.science?.length > 0 && <ScienceSection papers={data.science} year={data.date.year} />}
            {data.wayback?.length > 0 && <WaybackSection snapshots={data.wayback} />}
          </Suspense>

          <ShareSection date={date} name={name} />
        </div>

      </div>
    </>
  );
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default CapsulePage;