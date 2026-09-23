import PageHeader from '../components/PageHeader';
import Locked from '../components/Locked';
import WishForm from '../components/WishForm';
import WishWall, { SAMPLE_WISHES } from '../components/WishWall';
import { fx } from '../fx';
import { toast } from '../ui';
import { NAME } from '../config';

export default function WishesPage({ lock, wishes, onDelete }) {
  function onDone(wish) {
    wishes.prepend(wish);
    toast('Your wish is on the wall!', 'success');
    fx.confetti(180);
    fx.show(4, 1200);
    setTimeout(() => document.getElementById('wall')?.scrollIntoView({ behavior: 'smooth' }), 300);
  }

  return (
    <>
      <PageHeader
        title="Send wishes"
        sub={`Write ${NAME} a birthday note. It gets pinned to the wall for everyone to see.`}
      />
      <section className="page-section">
        <Locked lock={lock} label="Wishing opens in">
          <div className="glass-card form-card">
            <WishForm onDone={onDone} />
          </div>
        </Locked>
      </section>
      <section id="wall" className="page-section is-wide">
        <h2 className="section-title">The wishing wall</h2>
        <p className="section-sub">
          {lock.open ? `${wishes.items.length} ${wishes.items.length === 1 ? 'wish' : 'wishes'} and counting 💌` : 'Every wish shows up here at midnight 💌'}
        </p>
        <Locked lock={lock} label="The wall opens in" preview={<WishWall wishes={SAMPLE_WISHES} />}>
          <WishWall wishes={wishes} onDelete={onDelete} />
        </Locked>
      </section>
    </>
  );
}
