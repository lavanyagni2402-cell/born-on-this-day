import React from 'react';
import './sections.css';

const ROWS = [
  { key: 'EUR', symbol: '€' },
  { key: 'GBP', symbol: '£' },
  { key: 'INR', symbol: '₹' },
  { key: 'JPY', symbol: '¥' },
];

function CurrencySection({ currency }) {
  if (!currency || !currency.rates) return null;
  const hasAny = ROWS.some(r => currency.rates[r.key] != null);
  if (!hasAny) return null;

  return (
    <div className="card-topper">
      <div className="section-label">currency snapshot</div>
      <div className="card currency-card">
        <p className="currency-sub">$1 USD on that day</p>
        <div className="currency-list">
          {ROWS.map(({ key, symbol }) => {
            const rate = currency.rates[key];
            if (rate == null) return null;
            return (
              <div key={key} className="currency-row">
                <span className="currency-name">{key}</span>
                <span className="currency-value">{symbol}{rate.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CurrencySection;
