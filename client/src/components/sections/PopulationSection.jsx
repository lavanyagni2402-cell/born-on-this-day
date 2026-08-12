import React from 'react';
import './sections.css';

function PopulationSection({ population, year }) {
  return (
    <div className="card-topper">
      <div className="section-label">world population</div>
      <div className="card population-card">
        <div className="population-number">{population.formatted}</div>
        <p className="population-label">people on Earth in {year}</p>
        <p className="population-context">{population.context}</p>
      </div>
    </div>
  );
}

export default PopulationSection;