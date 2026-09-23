// "Happy Birthday" played with a soft music-box synth. No audio files needed.
const HZ = {
  G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
  C3: 130.81, F3: 174.61, G3: 196,
};
const MELODY = [
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
  ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
  ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3],
];
// Bass root notes, one per bar of 3 beats (after the 1-beat pickup)
const BASS = ['C3', 'G3', 'G3', 'C3', 'C3', 'F3', 'C3', 'G3', 'C3'];
const BEAT = 0.5;

let ctx = null;
let master = null;
let timer = null;
let playing = false;

function note(freq, t, dur, vol, type = 'triangle') {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.8);
  const o1 = ctx.createOscillator();
  o1.type = type;
  o1.frequency.value = freq;
  const o2 = ctx.createOscillator();
  o2.type = 'sine';
  o2.frequency.value = freq * 2;
  const g2 = ctx.createGain();
  g2.gain.value = 0.3;
  o1.connect(g);
  o2.connect(g2).connect(g);
  g.connect(master);
  o1.start(t);
  o2.start(t);
  o1.stop(t + dur + 0.9);
  o2.stop(t + dur + 0.9);
}

function playOnce() {
  if (!playing) return;
  const start = ctx.currentTime + 0.1;
  let t = start;
  for (const [n, beats] of MELODY) {
    note(HZ[n], t, beats * BEAT * 0.9, 0.2);
    t += beats * BEAT;
  }
  BASS.forEach((n, i) => note(HZ[n], start + BEAT + i * 3 * BEAT, 3 * BEAT, 0.07, 'sine'));
  timer = setTimeout(playOnce, (t - start + 2.5) * 1000);
}

export const music = {
  get playing() { return playing; },
  start() {
    if (playing) return;
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    ctx.resume();
    // A fresh output chain each time so notes scheduled before a stop stay silent
    master = ctx.createGain();
    master.gain.value = 0.9;
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.28;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.25;
    master.connect(ctx.destination);
    master.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(ctx.destination);
    playing = true;
    playOnce();
  },
  stop() {
    playing = false;
    clearTimeout(timer);
    if (master) {
      master.disconnect();
      master = null;
    }
  },
};
