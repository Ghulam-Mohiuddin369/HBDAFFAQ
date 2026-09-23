import { useEffect, useRef, useState } from 'react';
import Lightbox from './Lightbox';
import Icon from './Icon';
import { mediaUrl, videoPoster } from '../api';
import { NAME } from '../config';

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
      src={mediaUrl(m.url, 'c_fill,w_600,h_600,q_auto').replace(/\.[a-z0-9]+$/i, '.mp4')}
      poster={videoPoster(m.url)}
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}

function Tile({ m, fresh, onOpen }) {
  return (
    <button className={`tile ${fresh ? 'is-fresh' : ''}`} onClick={onOpen} aria-label={`Open memory from ${m.name}`}>
      {m.type === 'video' ? (
        <TileVideo m={m} />
      ) : (
        <img src={mediaUrl(m.url, 'c_fill,g_auto,w_600,h_600,q_auto,f_auto')} alt={m.caption || ''} loading="lazy" />
      )}
      <span className="tile-hover">
        <strong>{m.name}</strong>
        {m.caption && <span>{m.caption}</span>}
      </span>
    </button>
  );
}

const TEASER = ['cake', 'camera', 'sparkles', 'gift', 'balloon', 'heart', 'sparkles', 'camera', 'cake'];

// Placeholder tiles shown (blurred) while everything is locked
export function TeaserGrid() {
  return (
    <div className="grid">
      {TEASER.map((name, i) => (
        <span key={i} className="tile tile-teaser" style={{ '--h': i * 38 + 280 }}>
          <Icon name={name} size={34} strokeWidth={1.6} />
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
        <span className="feed-empty-icon"><Icon name="camera" size={34} strokeWidth={1.6} /></span>
        <strong>No memories yet</strong>
        <p>Share the first photo or video with {NAME}.</p>
        {onUpload && <button className="btn btn-primary" onClick={onUpload}><Icon name="camera" /> Share a memory</button>}
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
