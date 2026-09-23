import { useRef, useState } from 'react';
import { fx } from '../fx';
import { playPop } from '../sfx';
import { BALLOON_MESSAGES } from '../config';

const COLORS = ['#ff5fa2', '#ffd166', '#5ef0ff', '#b388ff', '#ff8a5b', '#7dffb0', '#ff7a7a'];
let uid = 0;

function makeBalloon(slot) {
  return {
    id: ++uid,
    slot,
    x: 4 + slot * 11.5 + Math.random() * 5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    duration: 11 + Math.random() * 7,
    delay: Math.random() * 12,
    sway: 12 + Math.random() * 18,
    size: 0.85 + Math.random() * 0.3,
  };
}

export default function Balloons() {
  const [balloons, setBalloons] = useState(() => Array.from({ length: 8 }, (_, i) => makeBalloon(i)));
  const [notes, setNotes] = useState([]);
  const [popped, setPopped] = useState(0);
  const fieldRef = useRef(null);

  function pop(b, e) {
    const r = e.currentTarget.getBoundingClientRect();
    const field = fieldRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.35;
    playPop();
    fx.burst(cx, cy, { colors: [b.color, '#ffffff'], count: 60, shape: 'sphere' });
    const text = BALLOON_MESSAGES[popped % BALLOON_MESSAGES.length];
    const note = { id: b.id, text, x: cx - field.left, y: cy - field.top, color: b.color };
    setPopped((n) => n + 1);
    setNotes((n) => [...n, note]);
    setTimeout(() => setNotes((n) => n.filter((x) => x.id !== note.id)), 2600);
    setBalloons((list) => list.map((x) => (x.id === b.id ? { ...makeBalloon(b.slot), fresh: true } : x)));
  }

  return (
    <section id="balloons" className="section balloons-section no-fx">
      <h2 className="section-title">Pop a balloon</h2>
      <p className="section-sub">Every balloon hides a little message {popped > 0 && `· ${popped} popped`}</p>
      <div className="balloon-field" ref={fieldRef}>
        {balloons.map((b) => (
          <button
            key={b.id}
            className="balloon"
            onClick={(e) => pop(b, e)}
            aria-label="Pop balloon"
            style={{
              left: `${b.x}%`,
              animationDuration: `${b.duration}s`,
              // first wave starts mid-flight; respawned balloons wait a moment below the field
              animationDelay: b.fresh ? '1.2s' : `-${b.delay}s`,
              '--c': b.color,
              '--sway': `${b.sway}px`,
              '--size': b.size,
            }}
          >
            <span className="balloon-inner">
              <span className="balloon-body" />
              <span className="balloon-string" />
            </span>
          </button>
        ))}
        {notes.map((n) => (
          <span key={n.id} className="balloon-note" style={{ left: n.x, top: n.y, '--c': n.color }}>
            {n.text}
          </span>
        ))}
      </div>
    </section>
  );
}
