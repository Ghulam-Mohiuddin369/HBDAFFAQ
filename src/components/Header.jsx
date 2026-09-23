import { useEffect, useState } from 'react';
import { navigate } from '../router';
import { AGE, NAME } from '../config';

export default function Header({ page, onWish, onUpload }) {
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
      <a href="/" className="brand" onClick={(e) => go(e, '/')}>
        {NAME}
        <span>✦{AGE}</span>
      </a>
      <nav className="topbar-actions">
        <button className="btn btn-ghost btn-sm" onClick={onWish}>
          💌 <span className="label-full">Give a wish</span><span className="label-short">Wish</span>
        </button>
        <button className="btn btn-primary btn-sm" onClick={onUpload}>
          📸 <span className="label-full">Upload a memory</span><span className="label-short">Upload</span>
        </button>
        {page === 'games' ? (
          <a href="/" className="btn btn-ghost btn-sm" onClick={(e) => go(e, '/')}>
            🏠 <span className="label-full">Home</span>
          </a>
        ) : (
          <a href="/games" className="btn btn-ghost btn-sm" onClick={(e) => go(e, '/games')}>
            🎮 <span className="label-full">Play games</span><span className="label-short">Games</span>
          </a>
        )}
      </nav>
    </header>
  );
}
