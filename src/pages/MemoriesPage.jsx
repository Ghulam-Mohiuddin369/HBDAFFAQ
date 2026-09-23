import PageHeader from '../components/PageHeader';
import Locked from '../components/Locked';
import UploadForm from '../components/UploadForm';
import MemoryGrid, { TeaserGrid } from '../components/MemoryGrid';
import { fx } from '../fx';
import { toast } from '../ui';
import { NAME } from '../config';

export default function MemoriesPage({ lock, memories, onDelete }) {
  function onDone(memory) {
    memories.prepend(memory);
    toast('Memory shared! Everyone can see it now.', 'success');
    fx.confetti(180);
    fx.show(4, 1200);
    setTimeout(() => document.getElementById('memories')?.scrollIntoView({ behavior: 'smooth' }), 300);
  }

  return (
    <>
      <PageHeader
        title="Share a memory"
        sub={`Got a photo or video with ${NAME}? Post it here and it joins his birthday feed.`}
      />
      <section className="page-section">
        <Locked lock={lock} label="Uploads open in">
          <div className="glass-card form-card">
            <UploadForm onDone={onDone} />
          </div>
        </Locked>
      </section>
      <section id="memories" className="page-section is-feed">
        <h2 className="section-title">All memories</h2>
        <p className="section-sub">
          {lock.open ? `${memories.items.length} ${memories.items.length === 1 ? 'memory' : 'memories'} shared 📸` : 'Every memory shows up here at midnight 📸'}
        </p>
        <Locked lock={lock} label="The feed opens in" preview={<TeaserGrid />}>
          <MemoryGrid memories={memories} onDelete={onDelete} />
        </Locked>
      </section>
    </>
  );
}
