import { useState } from 'react';
import Lightbox from './Lightbox';
import { mediaUrl, videoPoster } from '../api';
import { NAME } from '../config';

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

const TEASER = ['🎂', '📸', '🎉', '🥳', '🎈', '💜', '✨', '🎁', '🌟'];

// Placeholder tiles shown (blurred) while everything is locked
export function TeaserGrid() {
  return (
    <div className="grid">
      {TEASER.map((e, i) => (
        <span
          key={i}
          className="tile tile-teaser"
          style={{ '--h': i * 38 + 280 }}
        >
          {e}
        </span>
      ))}
    </div>
  );
}

export default function MemoryGrid({ memories, onDelete, onUpload }) {
  const [open, setOpen] = useState(-1);
  const list = memories.items;

  if (memories.status === 'loading') {
    return <div className="grid">{Array.from({ length: 6 }, (_, i) => <span key={i} className="tile is-skeleton" />)}</div>;
  }
  if (memories.status === 'error') {
    return <p className="feed-empty">Couldn&apos;t load memories right now. Try refreshing.</p>;
  }
  if (list.length === 0) {
    return (
      <div className="feed-empty">
        <span className="feed-empty-icon">📷</span>
        <strong>No memories yet</strong>
        <p>Share the first photo or video with {NAME}!</p>
        {onUpload && <button className="btn btn-primary" onClick={onUpload}>📸 Share a memory</button>}
      </div>
    );
  }

  return (
    <>
      <div className="grid">
        {list.map((m, i) => (
          <Tile key={m.id} m={m} fresh={memories.fresh.has(m.id)} onOpen={() => setOpen(i)} />
        ))}
      </div>
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
    </>
  );
}
