import React, { useState } from 'react';
import { saveCapsule } from '../../utils/api';
import './sections.css';

function ShareSection({ date, name }) {
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await saveCapsule(date, name);
      const url = `${window.location.origin}/share/${data.shareId}`;
      setShareUrl(url);
    } catch (err) {
      setError('Failed to save capsule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Born On This Day Time Capsule',
        text: `Check out what the world was like on my birthday!`,
        url: shareUrl,
      });
    }
  };

  return (
    <div className="share-section">
      <div className="share-inner">
        <div className="share-text">
          <div className="section-label">share your capsule</div>
          <h2 className="share-heading">
            <span className="serif-italic">send this</span> TIME CAPSULE
          </h2>
          <p className="share-desc">
            Save your capsule and get a unique link to share with friends and family.
          </p>
        </div>

        <div className="share-actions">
          {!shareUrl ? (
            <>
              <button
                className="btn btn-primary share-btn"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? '★ Saving...' : '★ Save & Get Share Link'}
              </button>
              {error && <p className="share-error">{error}</p>}
            </>
          ) : (
            <div className="share-url-block">
              <p className="share-success">★ Your capsule is saved!</p>
              <div className="share-url-row">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="share-url-input form-input"
                />
                <button className="btn btn-outline copy-btn" onClick={handleCopy}>
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              {navigator.share && (
                <button className="btn btn-outline" onClick={handleNativeShare} style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                  ↑ Share
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ShareSection;