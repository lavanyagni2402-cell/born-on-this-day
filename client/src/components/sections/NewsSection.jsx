import React from 'react';
import './sections.css';

function NewsSection({ news, year }) {
  return (
    <div className="section-block">
      <div className="section-label">headlines</div>
      <h2 className="section-title">The News on Your Birthday</h2>

      <div className="news-grid">
        {news.map((article, i) => (
          <div key={i} className={`news-card ${i === 0 ? 'news-card-featured' : ''}`}>
            {i === 0 && article.image && (
              <div className="news-image-wrapper">
                <img src={article.image} alt={article.title} className="news-image" onError={e => e.target.style.display='none'} />
                <div className="news-image-overlay"></div>
              </div>
            )}
            <div className="news-content">
              <div className="news-meta">
                <span className="news-source">{article.source || 'Historical Record'}</span>
                <span className="news-num">#{i + 1}</span>
              </div>
              <h4 className="news-title">
  {article.url ? (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {article.title}
    </a>
  ) : (
    article.title
  )}
</h4>

{article.url && (
  <a
    href={article.url}
    target="_blank"
    rel="noopener noreferrer"
    className="news-readmore"
  >
    Read Full Story →
  </a>
)}
              {article.description && (
                <p className="news-desc">{article.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewsSection;
