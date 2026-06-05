import React, { useState } from 'react';
import './sections.css';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function HistorySection({ events, month, day }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? events : events.slice(0, 5);

  return (
    <div className="section-block">
      <div className="section-label">on this day in history</div>
      <h2 className="section-title">{MONTH_NAMES[month - 1]} {day} Through the Ages</h2>

      <div className="history-timeline">
        {displayed.map((event, i) => (
          <div key={i} className="timeline-item">
            <div className="timeline-year-col">
              <span className="timeline-year">{event.year}</span>
              <div className="timeline-line"></div>
            </div>
            <div className="timeline-content">
              {event.pages?.[0]?.thumbnail && (
                <img
                  src={event.pages[0].thumbnail}
                  alt=""
                  className="timeline-thumb"
                  onError={e => e.target.style.display='none'}
                />
              )}
              <p className="timeline-text">
                {event.pages?.[0]?.url
                  ? <a href={event.pages[0].url} target="_blank" rel="noopener noreferrer">{event.text}</a>
                  : event.text
                }
              </p>
            </div>
          </div>
        ))}
      </div>

      {events.length > 5 && (
        <button className="btn btn-outline show-more-btn" onClick={() => setShowAll(!showAll)}>
          {showAll ? '↑ Show less' : `↓ Show ${events.length - 5} more events`}
        </button>
      )}
    </div>
  );
}

export default HistorySection;