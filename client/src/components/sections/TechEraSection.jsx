import React from 'react';
import './sections.css';

function TechSection({ tech }) {
  return (
    <div className="card tech-card">
      <div className="section-label">technology era</div>
      <div className="tech-era-header">
        <span className="tech-icon">{tech.icon}</span>
        <h3 className="tech-era-name">{tech.era}</h3>
      </div>
      <ul className="tech-list">
        {tech.highlights.map((item, i) => (
          <li key={i} className="tech-item">
            <span className="tech-bullet">▸</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TechSection;