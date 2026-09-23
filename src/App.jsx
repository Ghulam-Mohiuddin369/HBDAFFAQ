import { useState } from 'react';
import Starfield from './components/Starfield';
import Fireworks from './components/Fireworks';
import Gate from './components/Gate';
import Header from './components/Header';
import Hero from './components/Hero';
import Countdown from './components/Countdown';
import Feed from './components/Feed';
import Games from './components/Games';
import Modal from './components/Modal';
import WishForm from './components/WishForm';
import UploadForm from './components/UploadForm';
import MusicToggle from './components/MusicToggle';
import { api, useLiveList } from './api';
import { fx } from './fx';
import { music } from './music';
import { AGE, NAME } from './config';
import { navigate, usePath } from './router';

const INTERACTIVE = 'button, a, input, textarea, label, video, .no-fx';
const finePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

function celebrate() {
  fx.confetti(180);
  fx.show(4, 1200);
}

function showFeed() {
  navigate('/', 'feed');
}

export default function App() {
  const page = usePath();
  const [opened, setOpened] = useState(false);
  const [gateGone, setGateGone] = useState(false);
  const [modal, setModal] = useState(null); // 'wish' | 'upload' | null
  const [tab, setTab] = useState('memories');
  const memories = useLiveList(api.memories);
  const wishes = useLiveList(api.wishes);

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
    if (!window.confirm('Delete this for everyone?')) return;
    try {
      await api.remove(kind, item.id);
      (kind === 'wishes' ? wishes : memories).removeLocal(item.id);
    } catch (err) {
      window.alert(err.message);
    }
  }

  return (
    <>
      <Starfield />
      <div className="nebula" aria-hidden="true" />
      {opened && (
        <>
          <Header page={page} onWish={() => setModal('wish')} onUpload={() => setModal('upload')} />
          <main onPointerDown={onPointerDown} onPointerMove={onPointerMove}>
            {page === 'games' ? (
              <Games />
            ) : (
              <>
                <Hero />
                <Countdown />
                <Feed
                  tab={tab}
                  onTab={setTab}
                  memories={memories}
                  wishes={wishes}
                  onWish={() => setModal('wish')}
                  onUpload={() => setModal('upload')}
                  onDelete={remove}
                />
              </>
            )}
            <footer className="site-footer">
              <p>Made with 💜 for {NAME}&apos;s {AGE}nd birthday</p>
              <div className="profile-actions">
                <button className="btn btn-primary" onClick={() => setModal('upload')}>📸 Upload a memory</button>
                <button className="btn btn-ghost" onClick={() => setModal('wish')}>💌 Give a wish</button>
                {page === 'games' ? (
                  <button className="btn btn-ghost" onClick={() => navigate('/')}>🏠 Back home</button>
                ) : (
                  <button className="btn btn-ghost" onClick={() => navigate('/games')}>🎮 Play games</button>
                )}
              </div>
            </footer>
            <MusicToggle />
          </main>
        </>
      )}
      {modal === 'wish' && (
        <Modal title={`Wish ${NAME} a happy birthday`} onClose={() => setModal(null)}>
          <WishForm
            onDone={(wish) => {
              wishes.prepend(wish);
              setModal(null);
              setTab('wishes');
              showFeed();
              celebrate();
            }}
          />
        </Modal>
      )}
      {modal === 'upload' && (
        <Modal title="Share a memory" onClose={() => setModal(null)}>
          <UploadForm
            onDone={(memory) => {
              memories.prepend(memory);
              setModal(null);
              setTab('memories');
              showFeed();
              celebrate();
            }}
          />
        </Modal>
      )}
      {!gateGone && <Gate onOpen={open} />}
      <Fireworks />
    </>
  );
}
