import { useState } from 'react';
import { NAME } from '../config';

// Opening screen: a glowing gift box. Opening it also unlocks audio (browsers need a tap first).
export default function Gate({ onOpen }) {
  const [opening, setOpening] = useState(false);

  function open() {
    if (opening) return;
    setOpening(true);
    onOpen();
  }

  return (
    <div className={`gate ${opening ? 'is-opening' : ''}`}>
      <p className="gate-eyebrow">Psst… something special is waiting for</p>
      <h1 className="gate-name">{NAME}</h1>
      <button className="gift" onClick={open} aria-label="Open the gift">
        <span className="gift-glow" />
        <span className="gift-lid">
          <span className="gift-bow gift-bow-l" />
          <span className="gift-bow gift-bow-r" />
        </span>
        <span className="gift-box" />
      </button>
      <p className="gate-hint">Tap the gift to open 🎁</p>
    </div>
  );
}
