import Countdown from './Countdown';
import { formatUnlock } from '../lock';

// Shows a feature heavily blurred with a live countdown until the unlock moment.
export default function Locked({ lock, label, preview, children }) {
  if (lock.open) return children;
  return (
    <div className="locked no-fx">
      <div className="locked-blur" aria-hidden="true">{preview ?? children}</div>
      <div className="locked-overlay">
        <div className="locked-panel">
          <span className="locked-icon">🔒</span>
          <p className="locked-label">{label}</p>
          <Countdown left={lock.left} compact />
          {lock.date && <small className="locked-when">Opens {formatUnlock(lock.date)} 🎂</small>}
        </div>
      </div>
    </div>
  );
}
