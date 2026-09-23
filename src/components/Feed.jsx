import MemoryGrid, { TeaserGrid } from './MemoryGrid';
import WishWall, { SAMPLE_WISHES } from './WishWall';
import { GAMES } from './Games';
import { navigate } from '../router';
import { AGE, AVATAR, BIO, HANDLE, NAME } from '../config';
import Icon from './Icon';

// Instagram-style profile + memories/wishes tabs. `teaser` renders placeholder content for the lock screen.
export default function Feed({ tab, onTab, memories, wishes, onDelete, teaser = false }) {
  const toWishes = () => navigate('/wishes');
  const toMemories = () => navigate('/memories');

  return (
    <section id="feed" className="feed">
      <div className="profile">
        <div className="avatar-ring">
          <div className="avatar">{AVATAR ? <img src={AVATAR} alt={NAME} /> : <Icon name="cake" size={56} strokeWidth={1.4} />}</div>
        </div>
        <div className="profile-info">
          <div className="profile-handle">
            <h2>{HANDLE}</h2>
            <span className="verified" title="Birthday verified">✓</span>
          </div>
          <ul className="profile-stats">
            <li><b>{teaser ? '?' : memories.items.length}</b> memories</li>
            <li><b>{teaser ? '?' : wishes.items.length}</b> wishes</li>
            <li><b>{AGE}</b> years</li>
          </ul>
          <p className="profile-bio">
            <strong>{NAME}</strong>
            {BIO.map((line) => <span key={line}>{line}</span>)}
          </p>
          <div className="profile-actions">
            <button className="btn btn-primary btn-sm" onClick={toMemories}><Icon name="camera" size={16} /> Share memory</button>
            <button className="btn btn-sm" onClick={toWishes}><Icon name="mail" size={16} /> Send wishes</button>
          </div>
        </div>
      </div>

      <nav className="highlights" aria-label="Highlights">
        {GAMES.map(([emoji, label, , id]) => (
          <button key={id} className="highlight" onClick={() => navigate('/games', id)}>
            <span className="highlight-ring"><span><Icon name={emoji} size={26} strokeWidth={1.7} /></span></span>
            <small>{label}</small>
          </button>
        ))}
      </nav>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'memories'} className={tab === 'memories' ? 'is-on' : ''} onClick={() => onTab('memories')}>
          <Icon name="grid" size={14} /> Memories
        </button>
        <button role="tab" aria-selected={tab === 'wishes'} className={tab === 'wishes' ? 'is-on' : ''} onClick={() => onTab('wishes')}>
          <Icon name="mail" size={14} /> Wishes
        </button>
      </div>

      {tab === 'memories' && (teaser ? <TeaserGrid /> : <MemoryGrid memories={memories} onDelete={onDelete} onUpload={toMemories} />)}
      {tab === 'wishes' && <WishWall wishes={teaser ? SAMPLE_WISHES : wishes} onDelete={onDelete} onWish={toWishes} />}
    </section>
  );
}
