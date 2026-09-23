import { useEffect, useState } from 'react';

// Tiny pathname router. Vercel rewrites every non-API path to index.html.
const PAGES = { '/': 'home', '/wishes': 'wishes', '/memories': 'memories', '/games': 'games' };

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

function current() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return PAGES[path];
}

export function usePage() {
  const [page, setPage] = useState(() => current() || 'home');
  useEffect(() => {
    // unknown paths fall back to home
    if (!current()) window.history.replaceState(null, '', '/');
    const update = () => setPage(current() || 'home');
    window.addEventListener('popstate', update);
    window.addEventListener('route', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('route', update);
    };
  }, []);
  return page;
}
