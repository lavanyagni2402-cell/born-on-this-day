import React from 'react';
import './sections.css';

function WaybackSection({ snapshots }) {
  if (!snapshots || snapshots.length === 0) return null;

  return (
    <div className="section-block">
      <div className="section-label">the web, back then</div>
      <h2 className="section-title">The Internet as It Looked</h2>

      <div className="wayback-grid">
        {snapshots.map((site, i) => (
          <a
            key={i}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="wayback-card"
          >
            <span className="wayback-site-name">{site.name}</span>
            <span className="wayback-date">Archived {site.snapshotDate}</span>
            <span className="wayback-cta">View snapshot →</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default WaybackSection;
