import React from 'react';
import './sections.css';

function PhotosSection({ photos, year }) {
  if (!photos || photos.length === 0) return null;

  return (
    <div className="section-block">
      <div className="section-label">photos from the era</div>
      <h2 className="section-title">A Look Back at {year}</h2>

      <div className="photos-grid">
        {photos.map((photo, i) => (
          <a
            key={i}
            href={photo.link}
            target="_blank"
            rel="noopener noreferrer"
            className="photo-item"
          >
            <img
              src={photo.thumb}
              alt={photo.alt || 'Photo from the era'}
              className="photo-item-image"
              loading="lazy"
              onError={e => e.target.closest('.photo-item').style.display = 'none'}
            />
            {photo.photographer && (
              <span className="photo-credit">📷 {photo.photographer}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

export default PhotosSection;
