import { useEffect, useRef, useState } from 'react';
import Lightbox from './Lightbox';
import Icon from './Icon';
import { mediaUrl, videoPoster } from '../api';
import { NAME } from '../config';
import { useReveal } from '../useReveal';

// Silent looping preview that only plays while it's on screen
function TileVideo({ m }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    v.muted = true;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={mediaUrl(m.url, 'c_fill,w_700,h_700,q_auto').replace(/\.[a-z0-9]+$/i, '.mp4')}
      poster={videoPoster(m.url, 'so_0,c_fill,w_700,h_700,q_auto')}
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}

// A padded glass card: rounded media on top, who shared it underneath
function Tile({ m, i, fresh, onOpen }) {
  return (
    <button
      className={`memory-card ${fresh ? 'is-fresh' : ''}`}
      style={{ '--i': Math.min(i, 11) }}
      onClick={onOpen}
      aria-label={`Open memory from ${m.name}`}
    >
      <span className="memory-media">
        {m.type === 'video' ? (
          <TileVideo m={m} />
        ) : (
          <img src={mediaUrl(m.url, 'c_fill,g_auto,w_700,h_700,q_auto,f_auto')} alt={m.caption || ''} loading="lazy" />
        )}
      </span>
      <span className="memory-meta">
        <span className="memory-avatar">{m.name.slice(0, 1).toUpperCase()}</span>
        <span className="memory-text">
          <strong>{m.name}</strong>
          {m.caption && <small>{m.caption}</small>}
        </span>
      </span>
    </button>
  );
}

// Cards rise into place one after another the first time the grid scrolls into view
function RevealGrid({ children }) {
  const [ref, visible] = useReveal(0.05);
  return (
    <div ref={ref} className={`grid memory-grid ${visible ? 'is-visible' : ''}`}>
      {children}
    </div>
  );
}

const TEASER = ['cake', 'camera', 'sparkles', 'gift', 'balloon', 'heart'];

// Placeholder cards shown (blurred) while everything is locked
export function TeaserGrid() {
  return (
    <div className="grid memory-grid is-visible">
      {TEASER.map((name, i) => (
        <span key={i} className="memory-card" style={{ '--i': 0 }}>
          <span className="memory-media tile-teaser" style={{ '--h': i * 38 + 280 }}>
            <Icon name={name} size={34} strokeWidth={1.6} />
          </span>
          <span className="memory-meta">
            <span className="memory-avatar" />
            <span className="memory-text"><strong>A friend</strong></span>
          </span>
        </span>
      ))}
    </div>
  );
}

export default function MemoryGrid({ memories, onDelete, onUpload }) {
  const [open, setOpen] = useState(-1);
  const list = memories.items;

  if (memories.status === 'loading') {
    return (
      <div className="grid memory-grid is-visible">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="memory-card is-skeleton" style={{ '--i': 0 }}>
            <span className="memory-media" />
            <span className="memory-meta"><span className="memory-avatar" /><span className="memory-line" /></span>
          </span>
        ))}
      </div>
    );
  }
  if (memories.status === 'error') {
    return <p className="feed-empty">Couldn&apos;t load memories right now. Try refreshing.</p>;
  }
  if (list.length === 0) {
    return (
      <div className="feed-empty">
        <span className="feed-empty-icon"><Icon name="camera" size={34} strokeWidth={1.6} /></span>
        <strong>No memories yet</strong>
        <p>Share the first photo or video with {NAME}.</p>
        {onUpload && <button className="btn btn-primary" onClick={onUpload}><Icon name="camera" /> Share a memory</button>}
      </div>
    );
  }

  return (
    <>
      <RevealGrid>
        {list.map((m, i) => (
          <Tile key={m.id} m={m} i={i} fresh={memories.fresh.has(m.id)} onOpen={() => setOpen(i)} />
        ))}
      </RevealGrid>
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
