import React from 'react';
import './sections.css';

const ROWS = [
  { key: 'dowJones', label: 'Dow Jones', symbolNote: 'DIA proxy' },
  { key: 'nasdaq', label: 'NASDAQ', symbolNote: 'QQQ proxy' },
  { key: 'sp500', label: 'S&P 500', symbolNote: 'SPY proxy' },
];

function StockSection({ stocks }) {
  if (!stocks) return null;
  const hasAny = ROWS.some(r => stocks[r.key]);
  if (!hasAny) return null;

  return (
    <div className="card-topper">
      <div className="section-label">markets that day</div>
      <div className="card stock-card">
        <div className="stock-list">
          {ROWS.map(({ key, label }) => {
            const entry = stocks[key];
            if (!entry) return null;
            return (
              <div key={key} className="stock-row">
                <span className="stock-name">{label}</span>
                <span className="stock-close">${entry.close}</span>
                {entry.date && <span className="stock-date">{entry.date}</span>}
              </div>
            );
          })}
        </div>
        <p className="stock-note">Tracked via ETF proxies, nearest available trading day.</p>
      </div>
    </div>
  );
}

export default StockSection;
