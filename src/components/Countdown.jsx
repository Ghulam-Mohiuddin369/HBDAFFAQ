import { useEffect, useState } from 'react';
import { BIRTHDAY, NAME } from '../config';

function parts(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [
    ['Days', Math.floor(s / 86400)],
    ['Hours', Math.floor((s % 86400) / 3600)],
    ['Minutes', Math.floor((s % 3600) / 60)],
    ['Seconds', s % 60],
  ];
}

// Shows a live countdown before the birthday, a banner on the day, and nothing afterwards.
export default function Countdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!BIRTHDAY) return null;
  const target = new Date(BIRTHDAY).getTime();
  if (Number.isNaN(target)) return null;
  const left = target - now;

  if (left <= 0) {
    if (left < -86400000) return null;
    return (
      <section className="countdown">
        <p className="countdown-today">🎉 It&apos;s today! Happy birthday, {NAME}! 🎉</p>
      </section>
    );
  }

  return (
    <section className="countdown">
      <p className="countdown-label">The big day arrives in</p>
      <div className="countdown-grid">
        {parts(left).map(([label, value]) => (
          <div className="countdown-cell" key={label}>
            <span className="countdown-num" key={value}>{String(value).padStart(2, '0')}</span>
            <span className="countdown-unit">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
