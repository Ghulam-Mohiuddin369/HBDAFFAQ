import { useEffect, useRef } from 'react';
import { CANVAS_DPR, LOW_POWER, loop } from '../perf';

// Pre-rendered glowing dot, drawn with drawImage (much cheaper than building paths per star).
function makeSprite(color) {
  const s = document.createElement('canvas');
  s.width = s.height = 16;
  const g = s.getContext('2d');
  const grad = g.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, color);
  grad.addColorStop(0.35, color);
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 16, 16);
  return s;
}

// Twinkling, drifting star layers with mouse parallax and the odd shooting star.
export default function Starfield() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const sprites = [makeSprite('#f3eeff'), makeSprite('#ffb3dd'), makeSprite('#aef6ff')];
    let w = 0;
    let h = 0;
    let stars = [];
    let shooting = null;
    let nextShoot = performance.now() + 2500;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * CANVAS_DPR;
      canvas.height = h * CANVAS_DPR;
      ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
      const count = Math.min(LOW_POWER ? 180 : 420, Math.floor((w * h) / (LOW_POWER ? 3200 : 2600)));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 2 + 0.5,
        sprite: sprites[Math.random() < 0.85 ? 0 : Math.random() < 0.5 ? 1 : 2],
      }));
    }

    function onMove(e) {
      mouse.tx = (e.clientX / w - 0.5) * 2;
      mouse.ty = (e.clientY / h - 0.5) * 2;
    }

    function frame(now) {
      const t = now / 1000;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        s.y += s.z * 0.1;
        if (s.y > h + 5) {
          s.y = -5;
          s.x = Math.random() * w;
        }
        const size = s.z * 4.5;
        ctx.globalAlpha = (0.55 + 0.45 * Math.sin(t * s.speed + s.phase)) * s.z;
        ctx.drawImage(s.sprite, s.x - mouse.x * s.z * 24 - size / 2, s.y - mouse.y * s.z * 24 - size / 2, size, size);
      }

      if (!shooting && now > nextShoot) {
        shooting = {
          x: Math.random() * w * 0.7 + w * 0.2,
          y: Math.random() * h * 0.3,
          vx: -(6 + Math.random() * 5),
          vy: 3 + Math.random() * 2.5,
          life: 1,
        };
      }
      if (shooting) {
        const s = shooting;
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.012;
        ctx.globalAlpha = Math.max(s.life, 0) * 0.9;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 10, s.y - s.vy * 10);
        ctx.stroke();
        if (s.life <= 0 || s.x < -100 || s.y > h + 100) {
          shooting = null;
          nextShoot = now + 3000 + Math.random() * 5000;
        }
      }
      ctx.globalAlpha = 1;
    }

    resize();
    window.addEventListener('resize', resize);
    if (!LOW_POWER) window.addEventListener('pointermove', onMove);
    const stop = loop(frame, LOW_POWER ? 30 : 50);
    return () => {
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
