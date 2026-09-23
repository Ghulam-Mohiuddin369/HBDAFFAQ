import { useEffect, useState } from 'react';

// Minimal two-page router: "/" (home) and "/games". Vercel rewrites every path to index.html.
export function navigate(path, anchor) {
  if (window.location.pathname !== path) {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new Event('route'));
  }
  // wait for the new page to render before scrolling
  setTimeout(() => {
    const el = anchor && document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 80);
}

export function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener('popstate', update);
    window.addEventListener('route', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('route', update);
    };
  }, []);
  return path.replace(/\/+$/, '') === '/games' ? 'games' : 'home';
}
