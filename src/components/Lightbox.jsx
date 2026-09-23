import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';
import { adminKey, mediaUrl, videoPoster } from '../api';
import { timeAgo } from '../time';

// Loops on its own with no visible controls; a tap reveals play/pause, mute and a seek bar for a moment.
function PostVideo({ m }) {
  const ref = useRef(null);
  const hideTimer = useRef(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [controls, setControls] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const v = ref.current;
    // Opening a post is a tap, so sound is usually allowed; fall back to muted if the browser refuses.
    v.muted = false;
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(() => setPaused(true));
    });
    return () => clearTimeout(hideTimer.current);
  }, [m.id]);

  function reveal() {
    setControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControls(false), 2600);
  }

  function togglePlay(e) {
    e.stopPropagation();
    const v = ref.current;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
    reveal();
  }

  function toggleMute(e) {
    e.stopPropagation();
    const v = ref.current;
    v.muted = !v.muted;
    setMuted(v.muted);
    reveal();
  }

  function seek(e) {
    e.stopPropagation();
    const v = ref.current;
    const r = e.currentTarget.getBoundingClientRect();
    if (v.duration) v.currentTime = ((e.clientX - r.left) / r.width) * v.duration;
    reveal();
  }

  return (
    <div className={`post-video ${controls || paused ? 'show-controls' : ''}`} onClick={reveal}>
      <video
        ref={ref}
        src={mediaUrl(m.url, 'q_auto').replace(/\.[a-z0-9]+$/i, '.mp4')}
        poster={videoPoster(m.url, 'so_0,q_auto')}
        loop
        playsInline
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
      />
      <button className="vc-center" onClick={togglePlay} aria-label={paused ? 'Play' : 'Pause'}>
        <Icon name={paused ? 'play' : 'pause'} size={26} />
      </button>
      <div className="vc-bar" onClick={(e) => e.stopPropagation()}>
        <button className="vc-btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
          <Icon name={muted ? 'mute' : 'volume'} size={18} />
        </button>
        <div className="vc-track" onClick={seek} role="slider" aria-label="Seek" aria-valuenow={Math.round(progress * 100)}>
          <span style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function Lightbox({ items, index, onIndex, onClose, onDelete }) {
  const m = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext) onIndex(index + 1);
      if (e.key === 'ArrowLeft' && hasPrev) onIndex(index - 1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [index, hasNext, hasPrev, onIndex, onClose]);

  if (!m) return null;
  const backdrop = m.type === 'video' ? videoPoster(m.url, 'so_0,w_400,q_auto') : mediaUrl(m.url, 'w_400,q_auto,f_auto');

  // Portal to <body> so the viewer covers the fixed header too
  return createPortal(
    <div className="lightbox" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <button className="glass-circle lightbox-close" onClick={onClose} aria-label="Close">
        <Icon name="x" size={20} />
      </button>

      <article className="post" key={m.id}>
        <div className="post-media" style={{ '--backdrop': `url("${backdrop}")` }}>
          {m.type === 'video' ? (
            <PostVideo m={m} />
          ) : (
            <img src={mediaUrl(m.url, 'c_limit,w_1600,h_1600,q_auto,f_auto')} alt={m.caption || `Memory shared by ${m.name}`} />
          )}
          {hasPrev && (
            <button className="glass-circle post-nav is-prev" onClick={() => onIndex(index - 1)} aria-label="Previous">
              <Icon name="left" size={22} />
            </button>
          )}
          {hasNext && (
            <button className="glass-circle post-nav is-next" onClick={() => onIndex(index + 1)} aria-label="Next">
              <Icon name="right" size={22} />
            </button>
          )}
        </div>
        <aside className="post-side">
          <header className="post-author">
            <span className="post-avatar">{m.name.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{m.name}</strong>
              <small>{m.type === 'video' ? 'Video' : 'Photo'} · {timeAgo(m.createdAt)}</small>
            </div>
          </header>
          {m.caption ? <p className="post-caption">{m.caption}</p> : <p className="post-caption is-empty">No caption</p>}
          <footer className="post-foot">
            <div className="post-dots" aria-label={`${index + 1} of ${items.length}`}>
              {items.length <= 12
                ? items.map((it, i) => (
                  <button
                    key={it.id}
                    className={i === index ? 'is-on' : ''}
                    onClick={() => onIndex(i)}
                    aria-label={`Go to post ${i + 1}`}
                  />
                ))
                : <span>{index + 1} / {items.length}</span>}
            </div>
            {adminKey && (
              <button className="btn btn-sm" onClick={() => onDelete(m)}>
                <Icon name="trash" size={16} /> Delete
              </button>
            )}
          </footer>
        </aside>
      </article>
    </div>,
    document.body,
  );
}
