import { useState } from 'react';
import Hero from '../components/Hero';
import Feed from '../components/Feed';
import Locked from '../components/Locked';

export default function HomePage({ lock, memories, wishes, onDelete }) {
  const [tab, setTab] = useState('memories');
  const feed = (teaser) => (
    <Feed tab={tab} onTab={setTab} memories={memories} wishes={wishes} onDelete={onDelete} teaser={teaser} />
  );

  return (
    <>
      <Hero lock={lock} />
      <Locked lock={lock} label="Memories & wishes unlock in" preview={feed(true)}>
        {feed(false)}
      </Locked>
    </>
  );
}
