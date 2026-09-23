// Tiny synthesized sound effects (no audio files). Created lazily on first use, which is always a tap.
let ctx = null;
let noise = null;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    // half a second of white noise, reused for every pop
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Balloon pop: a sharp filtered noise snap plus a short low thump, slightly different every time.
export function playPop() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  const pitch = 0.85 + Math.random() * 0.35;

  const snap = ac.createBufferSource();
  snap.buffer = noise;
  const band = ac.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = 0.9;
  band.frequency.setValueAtTime(2400 * pitch, t);
  band.frequency.exponentialRampToValueAtTime(500 * pitch, t + 0.09);
  const snapGain = ac.createGain();
  snapGain.gain.setValueAtTime(0.0001, t);
  snapGain.gain.exponentialRampToValueAtTime(0.9, t + 0.004);
  snapGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  snap.connect(band).connect(snapGain).connect(ac.destination);
  snap.start(t);
  snap.stop(t + 0.14);

  const thump = ac.createOscillator();
  thump.type = 'sine';
  thump.frequency.setValueAtTime(190 * pitch, t);
  thump.frequency.exponentialRampToValueAtTime(55, t + 0.1);
  const thumpGain = ac.createGain();
  thumpGain.gain.setValueAtTime(0.0001, t);
  thumpGain.gain.exponentialRampToValueAtTime(0.5, t + 0.005);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
  thump.connect(thumpGain).connect(ac.destination);
  thump.start(t);
  thump.stop(t + 0.15);
}
