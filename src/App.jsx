import { useEffect, useRef, useState } from 'react';
import Starfield from './components/Starfield';
import Fireworks from './components/Fireworks';
import Gate from './components/Gate';
import Header from './components/Header';
import Games from './components/Games';
import MusicToggle from './components/MusicToggle';
import Popups from './components/Popups';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import WishesPage from './pages/WishesPage';
import MemoriesPage from './pages/MemoriesPage';
import { api, useLiveList } from './api';
import { useUnlock } from './lock';
import { dialog, toast } from './ui';
import { fx } from './fx';
import { music } from './music';
import { AGE, NAME } from './config';
import { navigate, usePage } from './router';
import Icon from './components/Icon';

const INTERACTIVE = 'button, a, input, textarea, label, video, .no-fx';
const finePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

export default function App() {
  const page = usePage();
  const lock = useUnlock();
  const [opened, setOpened] = useState(false);
  const [gateGone, setGateGone] = useState(false);
  const memories = useLiveList(api.memories, lock.open);
  const wishes = useLiveList(api.wishes, lock.open);

  // Midnight: celebrate for everyone who has the page open
  const wasOpen = useRef(lock.open);
  useEffect(() => {
    if (lock.open && !wasOpen.current && !lock.admin) {
      fx.show(14, 4000);
      fx.confetti(300);
      dialog({
        icon: 'cake',
        title: `It's ${NAME}'s birthday!`,
        message: 'Everything is unlocked. Send your wishes, share memories and play the games!',
        confirmText: "Let's party",
      });
    }
    wasOpen.current = lock.open;
  }, [lock.open, lock.admin]);

  function open() {
    music.start();
    fx.confetti(120);
    setTimeout(() => setOpened(true), 700);
    setTimeout(() => setGateGone(true), 1500);
  }

  function onPointerDown(e) {
    if (e.target.closest(INTERACTIVE)) return;
    fx.burst(e.clientX, e.clientY);
  }

  function onPointerMove(e) {
    if (finePointer && Math.random() < 0.5) fx.sparkle(e.clientX, e.clientY);
  }

  async function remove(kind, item) {
    const ok = await dialog({
      icon: 'trash',
      title: 'Delete this for everyone?',
      message: 'This removes it from the site permanently.',
      confirmText: 'Delete',
      cancelText: 'Keep it',
    });
    if (!ok) return;
    try {
      await api.remove(kind, item.id);
      (kind === 'wishes' ? wishes : memories).removeLocal(item.id);
      toast('Deleted.', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const pages = {
    home: <HomePage lock={lock} memories={memories} wishes={wishes} onDelete={remove} />,
    wishes: <WishesPage lock={lock} wishes={wishes} onDelete={remove} />,
    memories: <MemoriesPage lock={lock} memories={memories} onDelete={remove} />,
    games: <Games lock={lock} />,
  };

  return (
    <>
      <Starfield />
      <div className="nebula" aria-hidden="true" />
      {opened && (
        <>
          <Header page={page} />
          <main key={page} onPointerDown={onPointerDown} onPointerMove={onPointerMove}>
            <ErrorBoundary>{pages[page]}</ErrorBoundary>
            <footer className="site-footer">
              <p className="footer-love">Made with <Icon name="heart" size={15} /> for {NAME}&apos;s {AGE}nd birthday</p>
              <div className="profile-actions">
                {page !== 'home' && <button className="btn btn-sm" onClick={() => navigate('/')}><Icon name="home" size={16} /> Home</button>}
                {page !== 'wishes' && <button className="btn btn-sm" onClick={() => navigate('/wishes')}><Icon name="mail" size={16} /> Send wishes</button>}
                {page !== 'memories' && <button className="btn btn-sm" onClick={() => navigate('/memories')}><Icon name="camera" size={16} /> Share memory</button>}
                {page !== 'games' && <button className="btn btn-sm" onClick={() => navigate('/games')}><Icon name="gamepad" size={16} /> Games</button>}
              </div>
              <div className="credit">
                <span className="credit-line" aria-hidden="true" />
                <p>
                  <Icon name="gift" size={16} /> A gift from <strong>MD TECH</strong>
                </p>
                <small>This website was made by MD for {NAME}.</small>
              </div>
            </footer>
          </main>
          <MusicToggle />
          {lock.admin && <span className="admin-badge">Admin preview: unlocked for you only</span>}
        </>
      )}
      {!gateGone && <Gate onOpen={open} />}
      <Popups />
      <Fireworks />
    </>
  );
}
