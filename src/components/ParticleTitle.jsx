import { useEffect, useRef } from 'react';

const STOPS = [
  [255, 209, 102], // gold
  [255, 95, 162], // pink
  [94, 240, 255], // cyan
];

function colorAt(t) {
  const seg = t < 0.5 ? 0 : 1;
  const k = t < 0.5 ? t * 2 : (t - 0.5) * 2;
  const a = STOPS[seg];
  const b = STOPS[seg + 1];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// Thousands of particles fly in from everywhere and assemble into the text.
// They dodge the pointer, and a tap scatters them.
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
    let raf = 0;
    let alive = true;
    let formed = false;
    const start = performance.now();
    const mouse = { x: -9999, y: -9999 };

    async function build() {
      if (document.fonts?.ready) await document.fonts.ready;
      if (!alive) return;
      const rect = wrap.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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
      const gap = w < 520 ? 4 : 5;
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
          size: Math.random() * 1.6 + 1.8,
          seed: Math.random() * 1000,
          delay: Math.random() * 0.8,
        };
        p.tx = tx;
        p.ty = ty;
        p.color = colorAt(Math.min(1, Math.max(0, (tx - w * 0.2) / (w * 0.6))));
        return p;
      });
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
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of particles) {
        const active = t > p.delay;
        if (active) {
          const tx = p.tx + Math.sin(t * 1.6 + p.seed) * 0.8;
          const ty = p.ty + Math.cos(t * 1.3 + p.seed) * 0.8;
          const pull = 0.012 + Math.min(t, 3) * 0.008;
          p.vx += (tx - p.x) * pull;
          p.vy += (ty - p.y) * pull;
        }
        const mx = p.x - mouse.x;
        const my = p.y - mouse.y;
        const d2 = mx * mx + my * my;
        if (d2 < 7000) {
          const d = Math.sqrt(d2) || 1;
          const f = ((7000 - d2) / 7000) * 3.2;
          p.vx += (mx / d) * f;
          p.vy += (my / d) * f;
        }
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      if (!formed && t > 2.6) {
        formed = true;
        formedRef.current?.();
      }
      raf = requestAnimationFrame(frame);
    }

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 120);
    });
    build().then(() => {
      if (alive) raf = requestAnimationFrame(frame);
    });
    ro.observe(wrap);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointerdown', onDown);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      ro.disconnect();
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
