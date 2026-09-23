import ParticleTitle from './ParticleTitle';
import { fx } from '../fx';
import { AGE, NAME } from '../config';

const LINE = 'Happy Birthday';

export default function Hero() {
  function celebrate() {
    fx.show(7, 2200);
    setTimeout(() => fx.confetti(140), 900);
  }

  return (
    <section id="top" className="hero">
      <p className="hero-eyebrow">✦ Level {AGE} unlocked ✦</p>
      <ParticleTitle text={String(AGE)} onFormed={celebrate} />
      <h1 className="neon-line" aria-label={LINE}>
        {LINE.split('').map((ch, i) => (
          <span key={i} style={{ '--i': i }} aria-hidden="true">
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </h1>
      <h2 className="hero-name">{NAME}</h2>
      <p className="hero-tip">Tap anywhere for fireworks · move over the {AGE} to play</p>
      <a className="scroll-cue" href="#feed" aria-label="Scroll down">
        <span />
      </a>
    </section>
  );
}
