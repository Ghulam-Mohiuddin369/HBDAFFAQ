import Cake from './Cake';
import Letter from './Letter';
import Balloons from './Balloons';
import Wishes22 from './Wishes22';
import Locked from './Locked';
import PageHeader from './PageHeader';
import { AGE, NAME } from '../config';

export const GAMES = [
  ['🎂', 'Blow the candles', `${AGE} candles, one wish`, 'cake'],
  ['💌', 'Open the letter', 'A note just for him', 'letter'],
  ['🎈', 'Pop balloons', 'Each hides a message', 'balloons'],
  ['✨', `${AGE} wishes`, 'Flip all the cards', 'wishes22'],
];

export default function Games({ lock }) {
  return (
    <>
      <PageHeader
        title="Play & celebrate"
        sub={`Blow out ${NAME}'s candles, pop some balloons and flip the wish cards. Tap anywhere for fireworks 🎆`}
      />
      <div className="game-menu">
        {GAMES.map(([emoji, title, sub, id], i) => (
          <button
            key={id}
            className="game-card"
            style={{ '--i': i }}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span>{emoji}</span>
            <strong>{title}</strong>
            <small>{sub}</small>
            {!lock.open && <em className="game-lock">🔒 Locked</em>}
          </button>
        ))}
      </div>
      <Locked lock={lock} label="The cake gets lit in"><Cake /></Locked>
      <Locked lock={lock} label="The letter opens in"><Letter /></Locked>
      <Locked lock={lock} label="Balloons release in"><Balloons /></Locked>
      <Locked lock={lock} label={`The ${AGE} wishes unlock in`}><Wishes22 /></Locked>
    </>
  );
}
