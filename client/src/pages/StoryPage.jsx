import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchCapsule, getBrowserCoords } from '../utils/api';
import { buildStoryCards } from '../utils/storyCards';
import LoadingScreen from '../components/story/LoadingScreen';
import StoryContainer from '../components/story/StoryContainer';
import './StoryPage.css';

function StoryPage() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch capsule data exactly once for this flow. This data is then
  // handed off to /capsule/:date via router state so the summary page
  // doesn't need to fetch it again.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    // Silently try for the visitor's coordinates (for the weather section);
    // falls back to null → server defaults to New York. Never blocks or
    // prompts more than the browser's own permission UI.
    getBrowserCoords()
      .then(coords => fetchCapsule(date, coords))
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(err => {
        if (cancelled) return;
        setError(err.response?.data?.error || 'Failed to load your time capsule. Please try again.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [date]);

  // Prevent the page behind this full-screen overlay from scrolling.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, []);

  const cards = useMemo(() => buildStoryCards(data), [data]);

  const handleComplete = () => {
    navigate(`/capsule/${date}`, { state: { data } });
  };

  // Nothing worth showing as a story (e.g. every data source failed) —
  // skip straight to the existing summary page rather than stalling.
  useEffect(() => {
    if (data && cards.length === 0) {
      handleComplete();
    }
  }, [data, cards.length]);

  return (
    <>
      <Helmet>
        <title>Opening your time capsule… — Born On This Day</title>
      </Helmet>

      {loading && <LoadingScreen />}

      {!loading && error && (
        <div className="story-error">
          <span className="story-error-icon">★</span>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>← Try Again</button>
        </div>
      )}

      {!loading && !error && cards.length > 0 && (
        <StoryContainer cards={cards} onComplete={handleComplete} />
      )}
    </>
  );
}

export default StoryPage;
