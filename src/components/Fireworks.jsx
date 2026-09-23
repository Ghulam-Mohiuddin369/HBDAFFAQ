import { useEffect, useRef } from 'react';
import { fx } from '../fx';
import { CANVAS_DPR, LOW_POWER, scale } from '../perf';

const COLORS = ['#ffd166', '#ff5fa2', '#5ef0ff', '#b388ff', '#ff8a5b', '#9dff8a', '#ffffff'];
const CONFETTI = ['#ffd166', '#ff5fa2', '#5ef0ff', '#b388ff', '#ff8a5b', '#9dff8a'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const MAX_SPARKS = LOW_POWER ? 900 : 2200;

// One full-screen overlay canvas for every rocket, spark and confetti piece.
// The animation loop only runs while something is on screen, so it costs nothing when idle.
export default function Fireworks() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    const rockets = [];
    const sparks = [];
    const confetti = [];

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * CANVAS_DPR;
      canvas.height = h * CANVAS_DPR;
      ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
    }

    function wake() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }

    function burst(x, y, { count = 90, colors, shape } = {}) {
      const palette = colors || [pick(COLORS), pick(COLORS)];
      const kind = shape || (Math.random() < 0.18 ? 'heart' : Math.random() < 0.3 ? 'ring' : 'sphere');
      const n = Math.min(scale(count), MAX_SPARKS - sparks.length);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        let vx;
        let vy;
        if (kind === 'heart') {
          vx = 16 * Math.sin(a) ** 3 * 0.3;
          vy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 0.3;
        } else {
          const speed = kind === 'ring' ? 4.6 + Math.random() * 0.4 : 1.5 + Math.random() * 4.5;
          vx = Math.cos(a + Math.random() * 0.2) * speed;
          vy = Math.sin(a + Math.random() * 0.2) * speed;
        }
        sparks.push({
          x, y, vx, vy,
          life: 1,
          decay: 0.009 + Math.random() * 0.01,
          color: pick(palette),
          size: 1.4 + Math.random() * 1.6,
          twinkle: Math.random() < 0.35,
          drag: kind === 'heart' ? 0.965 : 0.978,
        });
      }
      sparks.push({ x, y, vx: 0, vy: 0, life: 1, decay: 0.08, color: '#fff', size: 18, flash: true, drag: 1 });
      wake();
    }

    function rocket(x = w * (0.15 + Math.random() * 0.7), opts = {}) {
      const targetY = h * (0.12 + Math.random() * 0.3);
      const g = 0.09;
      rockets.push({ x, y: h + 10, vx: (Math.random() - 0.5) * 1.2, vy: -Math.sqrt(2 * g * (h - targetY)), g, color: pick(COLORS), opts });
      wake();
    }

    function addConfetti(count) {
      const n = scale(count);
      for (let i = 0; i < n; i++) {
        confetti.push({
          x: Math.random() * w,
          y: -20 - Math.random() * h * 0.5,
          vx: (Math.random() - 0.5) * 2,
          vy: 2 + Math.random() * 3,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.25,
          wobble: Math.random() * Math.PI * 2,
          size: 6 + Math.random() * 7,
          color: pick(CONFETTI),
        });
      }
      wake();
    }

    function sparkle(x, y) {
      if (sparks.length > MAX_SPARKS) return;
      sparks.push({
        x, y,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2 + 0.4,
        life: 0.9,
        decay: 0.035,
        color: pick(['#ffd166', '#ff9fd0', '#9ff6ff', '#ffffff']),
        size: 1.5 + Math.random() * 1.5,
        twinkle: true,
        drag: 0.96,
      });
      wake();
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);

      if (rockets.length || sparks.length) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        for (let i = rockets.length - 1; i >= 0; i--) {
          const r = rockets[i];
          r.x += r.vx;
          r.y += r.vy;
          r.vy += r.g;
          ctx.globalAlpha = 1;
          ctx.strokeStyle = r.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x - r.vx * 3, r.y - r.vy * 3);
          ctx.stroke();
          if (r.vy >= -0.5) {
            rockets.splice(i, 1);
            burst(r.x, r.y, r.opts);
          }
        }

        // swap-remove dead sparks instead of splicing (no array shifting)
        let n = sparks.length;
        for (let i = n - 1; i >= 0; i--) {
          const s = sparks[i];
          s.vx *= s.drag;
          s.vy = s.vy * s.drag + (s.flash ? 0 : 0.045);
          s.x += s.vx;
          s.y += s.vy;
          s.life -= s.decay;
          if (s.life <= 0) {
            sparks[i] = sparks[n - 1];
            n--;
            continue;
          }
          ctx.globalAlpha = s.twinkle ? s.life * (0.4 + Math.random() * 0.6) : s.life;
          if (s.flash) {
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * (2 - s.life), 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.size;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x - s.vx * 2.5, s.y - s.vy * 2.5);
            ctx.stroke();
          }
        }
        sparks.length = n;
      }

      if (confetti.length) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        let n = confetti.length;
        for (let i = n - 1; i >= 0; i--) {
          const c = confetti[i];
          c.wobble += 0.08;
          c.x += c.vx + Math.sin(c.wobble) * 1.2;
          c.y += c.vy;
          c.rot += c.vr;
          if (c.y > h + 30) {
            confetti[i] = confetti[n - 1];
            n--;
            continue;
          }
          const cos = Math.cos(c.rot);
          const sin = Math.sin(c.rot);
          const flip = Math.cos(c.wobble * 1.5);
          ctx.setTransform(cos * CANVAS_DPR, sin * CANVAS_DPR, -sin * flip * CANVAS_DPR, cos * flip * CANVAS_DPR, c.x * CANVAS_DPR, c.y * CANVAS_DPR);
          ctx.fillStyle = c.color;
          ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
        }
        confetti.length = n;
        ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      if (rockets.length || sparks.length || confetti.length) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, w, h);
        running = false;
      }
    }

    resize();
    window.addEventListener('resize', resize);
    fx.register({ burst, rocket, confetti: addConfetti, sparkle });
    return () => {
      cancelAnimationFrame(raf);
      running = false;
      window.removeEventListener('resize', resize);
      fx.register(null);
    };
  }, []);

  return <canvas ref={ref} className="fireworks" aria-hidden="true" />;
}
