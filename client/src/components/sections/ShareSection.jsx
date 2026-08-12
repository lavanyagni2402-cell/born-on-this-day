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
    }).catch((err) => {
      console.error('Copy failed:', err);
    });
  };

  const shareText = 'Check out what the world was like on my birthday!';
  const socialLinks = shareUrl ? {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
  } : null;

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Born On This Day Time Capsule',
        text: `Check out what the world was like on my birthday!`,
        url: shareUrl,
      }).catch((err) => {
        // AbortError just means the user closed the share sheet without
        // picking anything — not a real error, nothing to do.
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      });
    }
  };

  return (
    <div className="card-topper">
      <div className="section-label">share your capsule</div>
      <div className="share-section">
        <div className="share-inner">
          <div className="share-text">
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
                {socialLinks && (
                  <div className="share-social-row">
                    <a className="share-social-btn" href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>
                    <a className="share-social-btn" href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    <a className="share-social-btn" href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default ShareSection;
