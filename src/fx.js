// Tiny bridge so any component can trigger the global fireworks/confetti canvas.
let impl = null;

export const fx = {
  register(i) { impl = i; },
  burst(x, y, opts) { impl?.burst(x, y, opts); },
  rocket(x, opts) { impl?.rocket(x, opts); },
  show(count = 6, spread = 1800) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => impl?.rocket(), Math.random() * spread);
    }
  },
  confetti(count = 180) { impl?.confetti(count); },
  sparkle(x, y) { impl?.sparkle(x, y); },
};
