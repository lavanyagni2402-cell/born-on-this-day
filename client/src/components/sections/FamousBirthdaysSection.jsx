import React from 'react';
import './sections.css';

function BirthdaysSection({ birthdays }) {
  return (
    <div className="section-block">
      <div className="section-label">famous birthdays</div>
      <h2 className="section-title">Born on Your Day</h2>
      <p className="section-sub">Notable people who share your exact birth date (across all years)</p>

      <div className="birthdays-grid">
        {birthdays.slice(0, 12).map((person, i) => (
          <a
            key={i}
            href={person.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="birthday-card"
          >
            <div className="birthday-photo-wrapper">
              {person.thumbnail ? (
                <img
                  src={person.thumbnail}
                  alt={person.name}
                  className="birthday-photo"
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="birthday-photo-fallback" style={{ display: person.thumbnail ? 'none' : 'flex' }}>
                <span>★</span>
              </div>
            </div>
            <div className="birthday-info">
              <h4 className="birthday-name">{person.name}</h4>
              <p className="birthday-year">b. {person.year}</p>
              <p className="birthday-desc">{person.description?.slice(0, 80)}...</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default BirthdaysSection;