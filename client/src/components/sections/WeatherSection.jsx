import React from 'react';
import './sections.css';

function WeatherSection({ weather }) {
  if (!weather) return null;

  return (
    <div className="card-topper">
      <div className="section-label">the skies that day</div>
      <div className="card weather-card">
        <p className="weather-location">{weather.location}</p>
        <div className="weather-temp-row">
          <span className="weather-temp-main">{weather.avgTemp}°</span>
          <span className="weather-temp-unit">{weather.units?.temperature || 'C'}</span>
        </div>
        <div className="weather-stats">
          <div className="weather-stat">
            <span className="weather-stat-label">High</span>
            <span className="weather-stat-value">{weather.maxTemp}°</span>
          </div>
          <div className="weather-stat">
            <span className="weather-stat-label">Low</span>
            <span className="weather-stat-value">{weather.minTemp}°</span>
          </div>
          <div className="weather-stat">
            <span className="weather-stat-label">Rain</span>
            <span className="weather-stat-value">{weather.rainfall}{weather.units?.precipitation || 'mm'}</span>
          </div>
          <div className="weather-stat">
            <span className="weather-stat-label">Wind</span>
            <span className="weather-stat-value">{weather.windSpeed}{weather.units?.wind || 'km/h'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherSection;
