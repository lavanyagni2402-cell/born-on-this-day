import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { loadSharedCapsule } from '../utils/api';
import './CapsulePage.css';

function SharedCapsulePage() {
  const { shareId } = useParams();
  const [shared, setShared] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSharedCapsule(shareId)
      .then(d => { setShared(d); setLoading(false); })
      .catch(() => { setError('Capsule not found or expired.'); setLoading(false); });
  }, [shareId]);

  if (loading) return <div className="capsule-page"><div className="container"><Loader /></div></div>;
  if (error) return (
    <div className="capsule-page">
      <div className="container error-state">
        <span className="error-icon">★</span>
        <h2>Capsule Not Found</h2>
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">← Create Your Own</Link>
      </div>
    </div>
  );

  const { data } = { data: shared.capsuleData };
  const capsule = shared.capsuleData;

  return (
    <>
      <Helmet>
        <title>{shared.name}'s Time Capsule — {capsule.date?.full}</title>
      </Helmet>

      <div className="capsule-page">
        <header className="capsule-masthead">
          <div className="masthead-noise"></div>
          <div className="container masthead-inner">
            <div className="masthead-top">
              <span className="tag">★ shared time capsule</span>
            </div>
            <div className="masthead-headline">
              {shared.name && (
                <p className="masthead-name">
                  <span className="serif-italic">this capsule belongs to</span> {shared.name}
                </p>
              )}
              <h1 className="masthead-title">
                <span className="masthead-born">born on</span>
                <span className="masthead-date-big">{capsule.date?.dayOfWeek}</span>
                <span className="masthead-date-line">
                  <span className="date-day">{capsule.date?.day}</span>
                  <span className="date-sep">/</span>
                  <span className="date-month">{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][capsule.date?.month - 1]}</span>
                  <span className="date-sep">/</span>
                  <span className="date-year">{capsule.date?.year}</span>
                </span>
              </h1>
            </div>
            <div className="masthead-bottom">
              <Link to="/" className="btn btn-outline" style={{ fontSize: '11px', padding: '8px 16px' }}>
                ★ Create your own capsule
              </Link>
            </div>
          </div>
        </header>

        <div className="container capsule-grid">
          <div className="capsule-col-main">
            {capsule.news?.length > 0 && <NewsSection news={capsule.news} year={capsule.date?.year} />}
            {capsule.music && <MusicSection music={capsule.music} year={capsule.date?.year} />}
            {capsule.wikipedia?.events?.length > 0 && <HistorySection events={capsule.wikipedia.events} month={capsule.date?.month} day={capsule.date?.day} />}
          </div>
          <div className="capsule-col-side">
            {capsule.moon && <MoonSection moon={capsule.moon} />}
            {capsule.population && <PopulationSection population={capsule.population} year={capsule.date?.year} />}
            {capsule.techEra && <TechSection tech={capsule.techEra} />}
          </div>
        </div>

        <div className="container">
          {capsule.movies?.length > 0 && <MoviesSection movies={capsule.movies} year={capsule.date?.year} />}
          {capsule.famousBirthdays?.length > 0 && <BirthdaysSection birthdays={capsule.famousBirthdays} />}
          <div style={{ textAlign: 'center', padding: '48px 0 0' }}>
            <Link to="/" className="btn btn-primary" style={{ fontSize: '14px', padding: '16px 40px' }}>
              ★ Open Your Own Time Capsule
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default SharedCapsulePage;