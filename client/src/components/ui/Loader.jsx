import React from 'react';
import './Loader.css';

const LOADING_MESSAGES = [
  'Traveling back in time...',
  'Dusting off the archives...',
  'Tuning the radio waves...',
  'Checking the moon phase...',
  'Reading the newspaper headlines...',
  'Rewinding the charts...',
  'Consulting the stars...',
];

function Loader({ message }) {
  const [msgIdx, setMsgIdx] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loader-container">
      <div className="loader-star-ring">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="loader-star" style={{ '--i': i }}>★</div>
        ))}
      </div>
      <div className="loader-center">
        <span className="loader-big-star">★</span>
      </div>
      <p className="loader-message">{message || LOADING_MESSAGES[msgIdx]}</p>
      <p className="loader-sub">This may take a few seconds</p>
    </div>
  );
}

export default Loader;