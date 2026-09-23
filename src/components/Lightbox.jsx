import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminKey, mediaUrl, videoPoster } from '../api';
import { timeAgo } from '../time';

export default function Lightbox({ items, index, onIndex, onClose, onDelete }) {
  const m = items[index];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && index < items.length - 1) onIndex(index + 1);
      if (e.key === 'ArrowLeft' && index > 0) onIndex(index - 1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [index, items.length, onIndex, onClose]);

  if (!m) return null;

  // Portal to <body> so the viewer covers the fixed header too
  return createPortal(
    <div className="lightbox" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <button className="icon-btn lightbox-close" onClick={onClose} aria-label="Close">✕</button>
      {index > 0 && (
        <button className="lightbox-nav is-prev" onClick={() => onIndex(index - 1)} aria-label="Previous">‹</button>
      )}
      {index < items.length - 1 && (
        <button className="lightbox-nav is-next" onClick={() => onIndex(index + 1)} aria-label="Next">›</button>
      )}
      <article className="post" key={m.id}>
        <div className="post-media">
          {m.type === 'video' ? (
            <video
              src={mediaUrl(m.url, 'q_auto').replace(/\.[a-z0-9]+$/i, '.mp4')}
              poster={videoPoster(m.url, 'so_0,q_auto')}
              controls
              autoPlay
              playsInline
              loop
            />
          ) : (
            <img src={mediaUrl(m.url, 'c_limit,w_1600,h_1600,q_auto,f_auto')} alt={m.caption || `Memory shared by ${m.name}`} />
          )}
        </div>
        <aside className="post-side">
          <header className="post-author">
            <span className="post-avatar">{m.name.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{m.name}</strong>
              <small>{timeAgo(m.createdAt)}</small>
            </div>
          </header>
          {m.caption ? <p className="post-caption">{m.caption}</p> : <p className="post-caption is-empty">No caption</p>}
          <footer className="post-foot">
            <span>{index + 1} / {items.length}</span>
            {adminKey && (
              <button className="btn btn-ghost btn-sm" onClick={() => onDelete(m)}>🗑 Delete</button>
            )}
          </footer>
        </aside>
      </article>
    </div>,
    document.body,
  );
}
