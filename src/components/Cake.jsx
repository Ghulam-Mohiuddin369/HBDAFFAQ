import { useEffect, useMemo, useRef, useState } from 'react';
import { fx } from '../fx';
import { AGE } from '../config';
import { useReveal } from '../useReveal';

const RY = 30; // half-height of the top tier's elliptical surface, in cake units

// Candles laid out on two elliptical rings on the top tier
function candleLayout(n) {
  const outer = Math.ceil(n * 0.62);
  const inner = n - outer;
  const pts = [];
  for (let i = 0; i < outer; i++) {
    const a = (i / outer) * Math.PI * 2 + 0.15;
    pts.push({ x: Math.cos(a) * 0.82, y: Math.sin(a) * 0.72 });
  }
  for (let i = 0; i < inner; i++) {
    const a = (i / inner) * Math.PI * 2 + 0.5;
    pts.push({ x: Math.cos(a) * 0.42, y: Math.sin(a) * 0.3 });
  }
  return pts.map((p, i) => ({ ...p, i, hue: [330, 190, 45, 265][i % 4] }));
}

// Deterministic drips that hang from the curved front edge of the frosting
function drips(count, seed) {
  return Array.from({ length: count }, (_, i) => {
    const f = (i + 0.5) / count;
    const r = Math.abs(Math.sin((i + 1) * 12.9898 + seed) * 43758.5453) % 1;
    return { f, len: 12 + r * 26, curve: Math.sqrt(1 - (2 * f - 1) ** 2) };
  });
}

const TIERS = [
  { w: 300, h: 74, z: 3, body: ['#b93d78', '#ff8fbf', '#ffd0e4'], frost: '#fff1f7', drips: drips(13, 1) },
  { w: 360, h: 84, z: 2, body: ['#5a31b8', '#a987ff', '#d9ccff'], frost: '#fff6d8', drips: drips(15, 2) },
  { w: 420, h: 92, z: 1, body: ['#1f7f95', '#5ee0f5', '#c3f8ff'], frost: '#ffe3f1', drips: drips(17, 3) },
];

export default function Cake() {
  const candles = useMemo(() => candleLayout(AGE), []);
  const [lit, setLit] = useState(() => candles.map(() => true));
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState('');
  const micRef = useRef(null);
  const [ref, visible] = useReveal(0.25);
  const litCount = lit.filter(Boolean).length;
  const allOut = litCount === 0;

  useEffect(() => {
    if (!allOut) return;
    stopMic();
    fx.show(10, 2600);
    fx.confetti(220);
  }, [allOut]);

  useEffect(() => stopMic, []);

  function blow(i) {
    setLit((prev) => (prev[i] ? prev.map((v, j) => (j === i ? false : v)) : prev));
  }

  function blowSome(k) {
    setLit((prev) => {
      const on = prev.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
      const next = [...prev];
      for (let n = 0; n < k && on.length; n++) {
        next[on.splice(Math.floor(Math.random() * on.length), 1)[0]] = false;
      }
      return next;
    });
  }

  function blowAll() {
    let delay = 0;
    candles.forEach((c) => {
      setTimeout(() => blow(c.i), delay);
      delay += 45;
    });
  }

  function relight() {
    setLit(candles.map(() => true));
  }

  async function startMic() {
    setMicError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ac.createAnalyser();
      analyser.fftSize = 512;
      ac.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      let raf = 0;
      let last = 0;
      const loop = (now) => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const v of data) sum += ((v - 128) / 128) ** 2;
        const rms = Math.sqrt(sum / data.length);
        if (rms > 0.16 && now - last > 70) {
          last = now;
          blowSome(rms > 0.3 ? 3 : 1);
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      micRef.current = { stream, ac, stop: () => cancelAnimationFrame(raf) };
      setListening(true);
    } catch {
      setMicError("Couldn't use the microphone. Tap the candles instead!");
    }
  }

  function stopMic() {
    const m = micRef.current;
    if (!m) return;
    m.stop();
    m.stream.getTracks().forEach((t) => t.stop());
    m.ac.close();
    micRef.current = null;
    setListening(false);
  }

  return (
    <section id="cake" className={`section cake-section no-fx ${visible ? 'is-visible' : ''}`} ref={ref}>
      <h2 className="section-title">Make a wish, {' '}blow the candles</h2>
      <p className="section-sub">
        {allOut
          ? 'Wish sent to the universe ✨'
          : `${litCount} of ${AGE} candles still burning: tap them, or actually blow into your mic`}
      </p>

      <div className="cake-stage">
        <div className="cake-halo" />
        <div className="cake">
          {TIERS.map((t, ti) => (
            <div
              key={ti}
              className="tier"
              style={{
                '--w': t.w,
                '--h': t.h,
                zIndex: t.z,
                '--b0': t.body[0],
                '--b1': t.body[1],
                '--b2': t.body[2],
                '--frost': t.frost,
              }}
            >
              <span className="tier-frost" />
              {t.drips.map((d, di) => (
                <span
                  key={di}
                  className="drip"
                  style={{
                    left: `${d.f * 100}%`,
                    top: `calc(${10 + RY * d.curve - 4} * var(--u))`,
                    height: `calc(${d.len} * var(--u))`,
                  }}
                />
              ))}
              <span className="tier-top" />
              <span className="tier-sprinkles" />
              {ti === 0 && candles.map((c) => (
                <button
                  key={c.i}
                  className={`candle ${lit[c.i] ? '' : 'is-out'}`}
                  style={{
                    left: `${50 + c.x * 50}%`,
                    top: `calc(${c.y * RY} * var(--u))`,
                    zIndex: Math.round((c.y + 1) * 50) + 10,
                    '--hue': c.hue,
                    '--scale': 0.86 + (c.y + 1) * 0.1,
                  }}
                  onClick={() => blow(c.i)}
                  aria-label={`Candle ${c.i + 1}${lit[c.i] ? '' : ' (out)'}`}
                >
                  <span className="flame" />
                  <span className="smoke" />
                </button>
              ))}
            </div>
          ))}
          <div className="plate" />
        </div>
      </div>

      <div className="cake-actions">
        {allOut ? (
          <button className="btn btn-ghost" onClick={relight}>🔥 Light them again</button>
        ) : (
          <>
            {listening ? (
              <button className="btn btn-primary is-pulsing" onClick={stopMic}>🎤 Listening… blow now!</button>
            ) : (
              <button className="btn btn-primary" onClick={startMic}>🌬️ Blow with your mic</button>
            )}
            <button className="btn btn-ghost" onClick={blowAll}>Blow them all out</button>
          </>
        )}
      </div>
      {micError && <p className="cake-error">{micError}</p>}
    </section>
  );
}
