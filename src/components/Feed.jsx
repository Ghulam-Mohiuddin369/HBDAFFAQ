import { useState } from 'react';
import Lightbox from './Lightbox';
import { adminKey, mediaUrl, videoPoster } from '../api';
import { timeAgo } from '../time';
import { AGE, AVATAR, BIO, HANDLE, NAME } from '../config';
import { NOTE_COLORS } from './WishForm';
import { GAMES } from './Games';
import { navigate } from '../router';


function tilt(id) {
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 7) - 3) * 0.8;
}

function Tile({ m, fresh, onOpen }) {
  const video = m.type === 'video';
  const play = (e) => e.currentTarget.querySelector('video')?.play().catch(() => {});
  const stop = (e) => {
    const v = e.currentTarget.querySelector('video');
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };
  return (
    <button
      className={`tile ${fresh ? 'is-fresh' : ''}`}
      onClick={onOpen}
      onMouseEnter={video ? play : undefined}
      onMouseLeave={video ? stop : undefined}
      aria-label={`Open memory from ${m.name}`}
    >
      {video ? (
        <video
          src={mediaUrl(m.url, 'c_fill,w_600,h_600,q_auto').replace(/\.[a-z0-9]+$/i, '.mp4')}
          poster={videoPoster(m.url)}
          muted
          loop
          playsInline
          preload="none"
        />
      ) : (
        <img src={mediaUrl(m.url, 'c_fill,g_auto,w_600,h_600,q_auto,f_auto')} alt={m.caption || ''} loading="lazy" />
      )}
      {video && <span className="tile-badge" aria-hidden="true">▶</span>}
      <span className="tile-hover">
        <strong>{m.name}</strong>
        {m.caption && <span>{m.caption}</span>}
      </span>
    </button>
  );
}

export default function Feed({ tab, onTab, memories, wishes, onWish, onUpload, onDelete }) {
  const [open, setOpen] = useState(-1);
  const list = memories.items;

  return (
    <section id="feed" className="feed">
      <div className="profile">
        <div className="avatar-ring">
          <div className="avatar">{AVATAR ? <img src={AVATAR} alt={NAME} /> : '🎂'}</div>
        </div>
        <div className="profile-info">
          <div className="profile-handle">
            <h2>{HANDLE}</h2>
            <span className="verified" title="Birthday verified">✓</span>
          </div>
          <ul className="profile-stats">
            <li><b>{list.length}</b> memories</li>
            <li><b>{wishes.items.length}</b> wishes</li>
            <li><b>{AGE}</b> years</li>
          </ul>
          <p className="profile-bio">
            <strong>{NAME}</strong>
            {BIO.map((line) => <span key={line}>{line}</span>)}
          </p>
          <div className="profile-actions">
            <button className="btn btn-primary btn-sm" onClick={onUpload}>📸 Upload a memory</button>
            <button className="btn btn-ghost btn-sm" onClick={onWish}>💌 Give a wish</button>
          </div>
        </div>
      </div>

      <nav className="highlights" aria-label="Highlights">
        {GAMES.map(([emoji, label, , id]) => (
          <button key={id} className="highlight" onClick={() => navigate('/games', id)}>
            <span className="highlight-ring"><span>{emoji}</span></span>
            <small>{label}</small>
          </button>
        ))}
      </nav>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'memories'} className={tab === 'memories' ? 'is-on' : ''} onClick={() => onTab('memories')}>
          ▦ Memories
        </button>
        <button role="tab" aria-selected={tab === 'wishes'} className={tab === 'wishes' ? 'is-on' : ''} onClick={() => onTab('wishes')}>
          💌 Wishes
        </button>
      </div>

      {tab === 'memories' && (
        <>
          {memories.status === 'loading' && <div className="grid">{Array.from({ length: 6 }, (_, i) => <span key={i} className="tile is-skeleton" />)}</div>}
          {memories.status === 'error' && <p className="feed-empty">Couldn&apos;t load memories right now. Try refreshing.</p>}
          {memories.status === 'ready' && list.length === 0 && (
            <div className="feed-empty">
              <span className="feed-empty-icon">📷</span>
              <strong>No memories yet</strong>
              <p>Share the first photo or video with {NAME}!</p>
              <button className="btn btn-primary" onClick={onUpload}>Upload a memory</button>
            </div>
          )}
          {list.length > 0 && (
            <div className="grid">
              {list.map((m, i) => (
                <Tile key={m.id} m={m} fresh={memories.fresh.has(m.id)} onOpen={() => setOpen(i)} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'wishes' && (
        <>
          {wishes.status === 'error' && <p className="feed-empty">Couldn&apos;t load wishes right now. Try refreshing.</p>}
          {wishes.status === 'ready' && wishes.items.length === 0 && (
            <div className="feed-empty">
              <span className="feed-empty-icon">💌</span>
              <strong>No wishes yet</strong>
              <p>Be the first to wish {NAME} a happy birthday!</p>
              <button className="btn btn-primary" onClick={onWish}>Give a wish</button>
            </div>
          )}
          <div className="wall">
            {wishes.items.map((w, i) => (
              <article
                key={w.id}
                className={`note ${wishes.fresh.has(w.id) ? 'is-fresh' : ''}`}
                style={{ '--note': w.color || NOTE_COLORS[0], '--tilt': `${tilt(w.id)}deg`, '--i': Math.min(i, 12) }}
              >
                <span className="note-pin" />
                <span className="note-emoji">{w.emoji}</span>
                <p className="note-msg">{w.message}</p>
                <footer className="note-foot">
                  <strong>{w.name}</strong>
                  <span>{timeAgo(w.createdAt)}</span>
                </footer>
                {adminKey && (
                  <button className="note-delete" onClick={() => onDelete('wishes', w)} aria-label="Delete wish">✕</button>
                )}
              </article>
            ))}
          </div>
        </>
      )}

      {open >= 0 && list[open] && (
        <Lightbox
          items={list}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(-1)}
          onDelete={(m) => {
            setOpen(-1);
            onDelete('memories', m);
          }}
        />
      )}
    </section>
  );
}
