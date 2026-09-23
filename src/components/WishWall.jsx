import { adminKey } from '../api';
import { timeAgo } from '../time';
import { NAME } from '../config';
import { NOTE_COLORS } from './WishForm';

function tilt(id) {
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 7) - 3) * 0.8;
}

// Stand-in notes shown (blurred) while everything is locked
export const SAMPLE_WISHES = {
  status: 'ready',
  fresh: new Set(),
  items: [
    ['Happy birthday! Have the best year ever 🎉', '🎉'],
    ['22 looks good on you, legend!', '🔥'],
    ['Wishing you all the happiness in the world', '💜'],
    ['Cake first, then the party 🎂', '🎂'],
    ['So proud of you, bro. Keep shining', '🌟'],
    ['Many many happy returns of the day!', '🎈'],
  ].map(([message, emoji], i) => ({
    id: `sample-${i}`,
    name: 'A friend',
    message,
    emoji,
    color: NOTE_COLORS[i % NOTE_COLORS.length],
    createdAt: Date.now(),
  })),
};

export default function WishWall({ wishes, onDelete, onWish }) {
  if (wishes.status === 'error') {
    return <p className="feed-empty">Couldn&apos;t load wishes right now. Try refreshing.</p>;
  }
  if (wishes.status === 'ready' && wishes.items.length === 0) {
    return (
      <div className="feed-empty">
        <span className="feed-empty-icon">💌</span>
        <strong>No wishes yet</strong>
        <p>Be the first to wish {NAME} a happy birthday!</p>
        {onWish && <button className="btn btn-primary" onClick={onWish}>💌 Send a wish</button>}
      </div>
    );
  }

  return (
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
          {adminKey && onDelete && (
            <button className="note-delete" onClick={() => onDelete('wishes', w)} aria-label="Delete wish">✕</button>
          )}
        </article>
      ))}
    </div>
  );
}
