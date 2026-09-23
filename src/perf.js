// Phones and small/low-core devices get lighter canvas effects (same look, fewer pixels and particles).
const mq = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches;

export const LOW_POWER =
  mq('(pointer: coarse)') ||
  mq('(max-width: 768px)') ||
  (typeof navigator !== 'undefined' && navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);

// Canvas resolution cap: sharp enough to look the same, far fewer pixels to push.
export const CANVAS_DPR = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, LOW_POWER ? 1 : 1.5);

// Scale particle counts down on low-power devices.
export const scale = (n) => Math.round(LOW_POWER ? n * 0.55 : n);

// Runs `frame(now)` on requestAnimationFrame, capped to `fps`, paused while the tab is hidden.
export function loop(frame, fps = LOW_POWER ? 40 : 60) {
  const step = 1000 / fps;
  let raf = 0;
  let last = 0;
  let running = true;
  const tick = (now) => {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    if (document.hidden || now - last < step - 1) return;
    last = now;
    frame(now);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    running = false;
    cancelAnimationFrame(raf);
  };
}
