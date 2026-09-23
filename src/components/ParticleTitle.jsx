import { useEffect, useRef } from 'react';
import { CANVAS_DPR, LOW_POWER, loop } from '../perf';

const STOPS = [
  [255, 209, 102], // gold
  [255, 95, 162], // pink
  [94, 240, 255], // cyan
];
const BUCKETS = 14; // particles share a handful of colors so each frame needs few fillStyle changes

function colorAt(t) {
  const seg = t < 0.5 ? 0 : 1;
  const k = t < 0.5 ? t * 2 : (t - 0.5) * 2;
  const a = STOPS[seg];
  const b = STOPS[seg + 1];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
const PALETTE = Array.from({ length: BUCKETS }, (_, i) => colorAt(i / (BUCKETS - 1)));

// Thousands of particles fly in from everywhere and assemble into the text.
// They dodge the pointer, a tap scatters them, and the animation pauses while off screen.
export default function ParticleTitle({ text, onFormed }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const formedRef = useRef(onFormed);
  formedRef.current = onFormed;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;
    let particles = [];
    let groups = [];
    let alive = true;
    let formed = false;
    let visible = true;
    let stop = null;
    const start = performance.now();
    const mouse = { x: -9999, y: -9999 };

    async function build() {
      if (document.fonts?.ready) await document.fonts.ready;
      if (!alive) return;
      const rect = wrap.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = w * CANVAS_DPR;
      canvas.height = h * CANVAS_DPR;
      ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);

      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      const o = off.getContext('2d', { willReadFrequently: true });
      const fontSize = Math.min(h * 1.05, w * 0.62);
      o.font = `900 ${fontSize}px Outfit, system-ui, sans-serif`;
      o.textAlign = 'center';
      o.textBaseline = 'middle';
      o.fillStyle = '#fff';
      o.fillText(text, w / 2, h / 2 + fontSize * 0.05);
      const data = o.getImageData(0, 0, w, h).data;
      const gap = LOW_POWER ? 6 : 5;
      const targets = [];
      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          if (data[(y * w + x) * 4 + 3] > 140) targets.push([x, y]);
        }
      }

      const old = particles;
      particles = targets.map(([tx, ty], i) => {
        const p = old[i] || {
          x: w / 2 + (Math.random() - 0.5) * w * 1.6,
          y: h / 2 + (Math.random() - 0.5) * h * 2.2,
          vx: 0,
          vy: 0,
          size: Math.random() * 1.4 + (LOW_POWER ? 2.4 : 2),
          seed: Math.random() * 1000,
          delay: Math.random() * 0.8,
        };
        p.tx = tx;
        p.ty = ty;
        p.bucket = Math.round(Math.min(1, Math.max(0, (tx - w * 0.2) / (w * 0.6))) * (BUCKETS - 1));
        return p;
      });
      groups = PALETTE.map((_, b) => particles.filter((p) => p.bucket === b));
    }

    function toLocal(e) {
      const r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    }
    function onMove(e) {
      [mouse.x, mouse.y] = toLocal(e);
    }
    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }
    function onDown(e) {
      const [cx, cy] = toLocal(e);
      for (const p of particles) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = Math.max(0, 240 - d) / 12;
        p.vx += (dx / d) * f + (Math.random() - 0.5) * 4;
        p.vy += (dy / d) * f + (Math.random() - 0.5) * 4;
      }
    }

    function frame(now) {
      if (!visible) return;
      const t = (now - start) / 1000;
      const pull = 0.012 + Math.min(t, 3) * 0.008;
      const hasMouse = mouse.x > -9000;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.92;
      for (let b = 0; b < groups.length; b++) {
        ctx.fillStyle = PALETTE[b];
        const list = groups[b];
        for (let i = 0; i < list.length; i++) {
          const p = list[i];
          if (t > p.delay) {
            p.vx += (p.tx + Math.sin(t * 1.6 + p.seed) * 0.8 - p.x) * pull;
            p.vy += (p.ty + Math.cos(t * 1.3 + p.seed) * 0.8 - p.y) * pull;
          }
          if (hasMouse) {
            const mx = p.x - mouse.x;
            const my = p.y - mouse.y;
            const d2 = mx * mx + my * my;
            if (d2 < 7000) {
              const d = Math.sqrt(d2) || 1;
              const f = ((7000 - d2) / 7000) * 3.2;
              p.vx += (mx / d) * f;
              p.vy += (my / d) * f;
            }
          }
          p.vx *= 0.86;
          p.vy *= 0.86;
          p.x += p.vx;
          p.y += p.vy;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      }
      ctx.globalAlpha = 1;
      if (!formed && t > 2.6) {
        formed = true;
        formedRef.current?.();
      }
    }

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 120);
    });
    // pause the whole simulation while the hero is scrolled away
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    build().then(() => {
      if (alive) stop = loop(frame, LOW_POWER ? 40 : 60);
    });
    ro.observe(wrap);
    io.observe(wrap);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointerdown', onDown);
    return () => {
      alive = false;
      stop?.();
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [text]);

  return (
    <div className="particle-title no-fx" ref={wrapRef}>
      <canvas ref={canvasRef} aria-label={text} role="img" />
    </div>
  );
}
