function parts(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [
    ['Days', Math.floor(s / 86400)],
    ['Hours', Math.floor((s % 86400) / 3600)],
    ['Mins', Math.floor((s % 3600) / 60)],
    ['Secs', s % 60],
  ];
}

export default function Countdown({ left, compact = false }) {
  return (
    <div className={`countdown-grid ${compact ? 'is-compact' : ''}`} role="timer">
      {parts(left).map(([label, value]) => (
        <div className="countdown-cell" key={label}>
          <span className="countdown-num" key={value}>{String(value).padStart(2, '0')}</span>
          <span className="countdown-unit">{label}</span>
        </div>
      ))}
    </div>
  );
}
