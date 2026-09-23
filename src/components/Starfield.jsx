import { useEffect, useRef } from 'react';

// Twinkling, drifting star layers with mouse parallax and the odd shooting star.
export default function Starfield() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;
    let stars = [];
    let shooting = null;
    let nextShoot = performance.now() + 2500;
    let raf = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(700, Math.floor((w * h) / 2200));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 2 + 0.5,
        hue: Math.random() < 0.15 ? (Math.random() < 0.5 ? 320 : 190) : 250,
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
        s.y += s.z * 0.08;
        if (s.y > h + 5) {
          s.y = -5;
          s.x = Math.random() * w;
        }
        const px = s.x - mouse.x * s.z * 24;
        const py = s.y - mouse.y * s.z * 24;
        const tw = 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
        const r = s.z * 1.5;
        ctx.globalAlpha = tw * s.z;
        ctx.fillStyle = `hsl(${s.hue}, 100%, ${s.hue === 250 ? 92 : 75}%)`;
        if (r > 1.1) {
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(px, py, r * 1.6, r * 1.6);
        }
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
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = Math.max(s.life, 0);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 14, s.y - s.vy * 14);
        ctx.stroke();
        if (s.life <= 0 || s.x < -100 || s.y > h + 100) {
          shooting = null;
          nextShoot = now + 3000 + Math.random() * 5000;
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
