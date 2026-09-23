import { useState } from 'react';
import { AGE, WISHES_22 } from '../config';
import { useReveal } from '../useReveal';

export default function Wishes22() {
  const [ref, visible] = useReveal(0.1);
  const [flipped, setFlipped] = useState(() => new Set());

  function toggle(i) {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <section id="wishes22" className={`section wishes22 ${visible ? 'is-visible' : ''}`} ref={ref}>
      <h2 className="section-title">{AGE} wishes for year {AGE}</h2>
      <p className="section-sub">Flip every card. Each one is a wish for the year ahead.</p>
      <div className="flip-grid">
        {WISHES_22.map(([emoji, text], i) => (
          <button
            key={i}
            className={`flip-card ${flipped.has(i) ? 'is-flipped' : ''}`}
            style={{ '--i': i }}
            onClick={() => toggle(i)}
            aria-label={`Wish ${i + 1}: ${text}`}
          >
            <span className="flip-inner">
              <span className="flip-front">
                <span className="flip-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="flip-q">?</span>
              </span>
              <span className="flip-back">
                <span className="flip-emoji">{emoji}</span>
                <span className="flip-text">{text}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
