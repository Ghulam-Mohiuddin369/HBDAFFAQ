import { useEffect, useState } from 'react';
import { navigate } from '../router';
import { AGE, NAME } from '../config';
import Icon from './Icon';

const LINKS = [
  ['wishes', '/wishes', 'mail', 'Send wishes', 'Wishes'],
  ['memories', '/memories', 'camera', 'Share memory', 'Memory'],
  ['games', '/games', 'gamepad', 'Games', 'Games'],
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
        <span className="brand-icon"><Icon name="cake" size={18} /></span>
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
            <Icon name={icon} size={17} />
            <span className="full">{full}</span>
            <span className="short">{short}</span>
          </a>
        ))}
      </nav>
    </header>
  );
}
