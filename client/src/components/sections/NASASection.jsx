import React, { useState } from "react";
import "./NASASection.css";

const DESCRIPTION_LIMIT = 220;

// nasa.image for a video entry is the embeddable player URL (e.g.
// https://www.youtube.com/embed/VIDEO_ID). We only ever open videos in a
// new tab now, so derive a normal watch URL to link to instead of embedding.
function toWatchUrl(url) {
  if (!url) return null;
  const embedMatch = url.match(/youtube\.com\/embed\/([^/?&]+)/);
  if (embedMatch) return `https://www.youtube.com/watch?v=${embedMatch[1]}`;
  return url;
}

function NASASection({ nasa }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);

  if (!nasa) return null;

  const explanation = nasa.explanation || "";
  const isLong = explanation.length > DESCRIPTION_LIMIT;
  const shortExplanation = isLong
    ? explanation.slice(0, DESCRIPTION_LIMIT).replace(/\s+\S*$/, "") + "…"
    : explanation;

  const showImage = nasa.mediaType === "image" && nasa.image && !imageFailed;
  const videoWatchUrl = nasa.mediaType === "video" ? toWatchUrl(nasa.image) : null;

  return (
    <div className="card-topper">
      <div className="section-label">
        🚀 NASA Astronomy Picture
      </div>

      <section className="card nasa-card">
      <div className="nasa-body">
        <div className="nasa-text">
          <h2 className="section-title">{nasa.title}</h2>
          <p className="nasa-description">
            {shortExplanation}
          </p>
          {nasa.link && (
            <a
              href={nasa.link}
              target="_blank"
              rel="noopener noreferrer"
              className="nasa-readmore"
            >
              Read full article →
            </a>
          )}
          {nasa.copyright && (
            <p className="nasa-credit">
              © {nasa.copyright}
            </p>
          )}
        </div>

        <div className="nasa-media">
          {/* IMAGE — large, fully responsive. Never shown if it fails to load. */}
          {showImage && (
            <a
              href={nasa.hdImage || nasa.image}
              target="_blank"
              rel="noopener noreferrer"
              className="nasa-image-wrapper"
            >
              <img
                src={nasa.image}
                alt={nasa.title}
                className="nasa-image"
                onError={() => setImageFailed(true)}
              />
              <span className="card-sticker">🚀 APOD</span>
            </a>
          )}

          {/* VIDEO — thumbnail with a play button; opens YouTube in a new tab
              instead of embedding an iframe. */}
          {nasa.mediaType === "video" && videoWatchUrl && (
            <a
              href={videoWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="nasa-video-thumb-wrapper"
            >
              {nasa.thumbnail && !thumbFailed ? (
                <img
                  src={nasa.thumbnail}
                  alt={nasa.title}
                  className="nasa-image"
                  onError={() => setThumbFailed(true)}
                />
              ) : (
                <div className="movie-poster-placeholder" style={{ aspectRatio: '16/9' }}>
                  <span className="movie-poster-icon">🚀</span>
                </div>
              )}
              <span className="nasa-video-play">▶</span>
              <span className="card-sticker">🚀 APOD</span>
            </a>
          )}
        </div>
      </div>
      </section>
    </div>
  );
}

export default NASASection;