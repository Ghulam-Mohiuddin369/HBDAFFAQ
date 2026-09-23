import PageHeader from '../components/PageHeader';
import Locked from '../components/Locked';
import WishForm from '../components/WishForm';
import Letter from '../components/Letter';
import WishWall, { SAMPLE_WISHES } from '../components/WishWall';
import { fx } from '../fx';
import { toast } from '../ui';
import { NAME } from '../config';

export default function WishesPage({ lock, wishes, onDelete }) {
  function onDone(wish) {
    wishes.prepend(wish);
    toast(lock.open ? 'Your wish is on the wall!' : 'Wish saved! It shows up on the wall at midnight.', 'success');
    fx.confetti(180);
    fx.show(4, 1200);
    setTimeout(() => document.getElementById('wall')?.scrollIntoView({ behavior: 'smooth' }), 300);
  }

  return (
    <>
      <PageHeader
        title="Send wishes"
        sub={lock.open
          ? `Write ${NAME} a birthday note. It gets pinned to the wall for everyone to see.`
          : `Write ${NAME} a birthday note now. Every wish stays hidden until midnight, then they all appear at once.`}
      />
      <section className="page-section">
        <div className="glass-card form-card">
          <WishForm onDone={onDone} />
        </div>
      </section>
      <Locked lock={lock} label="The letter opens in">
        <Letter />
      </Locked>
      <section id="wall" className="page-section is-wide">
        <h2 className="section-title">The wishing wall</h2>
        <p className="section-sub">
          {lock.open ? `${wishes.items.length} ${wishes.items.length === 1 ? 'wish' : 'wishes'} and counting` : 'Every wish shows up here at midnight'}
        </p>
        <Locked lock={lock} label="The wall opens in" preview={<WishWall wishes={SAMPLE_WISHES} />}>
          <WishWall wishes={wishes} onDelete={onDelete} />
        </Locked>
      </section>
    </>
  );
}
