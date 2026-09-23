import { useEffect, useState } from 'react';
import { navigate } from '../router';
import { AGE, NAME } from '../config';

const LINKS = [
  ['wishes', '/wishes', '💌', 'Send wishes', 'Wishes'],
  ['memories', '/memories', '📸', 'Share memory', 'Memory'],
  ['games', '/games', '🎮', 'Games', 'Games'],
];

export default function Header({ page }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function go(e, path) {
    e.preventDefault();
    navigate(path);
  }

  return (
    <header className={`topbar ${scrolled ? 'is-scrolled' : ''}`}>
      <a href="/" className="brand" onClick={(e) => go(e, '/')} aria-label="Home">
        <span className="brand-icon">🎂</span>
        <span className="brand-name">{NAME}</span>
        <span className="brand-age">✦{AGE}</span>
      </a>
      <nav className="glass-nav" aria-label="Pages">
        {LINKS.map(([key, path, icon, full, short]) => (
          <a
            key={key}
            href={path}
            className={`nav-pill ${page === key ? 'is-active' : ''}`}
            aria-current={page === key ? 'page' : undefined}
            onClick={(e) => go(e, path)}
          >
            <span aria-hidden="true">{icon}</span>
            <span className="full">{full}</span>
            <span className="short">{short}</span>
          </a>
        ))}
      </nav>
    </header>
  );
}
