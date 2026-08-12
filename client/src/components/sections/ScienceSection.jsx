import React from 'react';
import './sections.css';

function ScienceSection({ papers, year }) {
  if (!papers || papers.length === 0) return null;

  return (
    <div className="section-block">
      <div className="section-label">research that year</div>
      <h2 className="section-title">Science of {year}</h2>

      <div className="science-list">
        {papers.map((paper, i) => (
          <a
            key={i}
            href={paper.link}
            target="_blank"
            rel="noopener noreferrer"
            className="science-row"
          >
            <span className="science-num">{i + 1}</span>
            <div className="science-info">
              <p className="science-title">{paper.title}</p>
              <div className="science-meta">
                {paper.field && <span className="science-field">{paper.field}</span>}
                <span className="science-cited">{paper.citedBy} citations</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default ScienceSection;
