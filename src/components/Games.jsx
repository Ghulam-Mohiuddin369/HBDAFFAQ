import Cake from './Cake';
import Letter from './Letter';
import Balloons from './Balloons';
import Wishes22 from './Wishes22';
import { AGE, NAME } from '../config';

export const GAMES = [
  ['🎂', 'Blow the candles', `${AGE} candles, one wish`, 'cake'],
  ['💌', 'Open the letter', 'A note just for him', 'letter'],
  ['🎈', 'Pop balloons', 'Each hides a message', 'balloons'],
  [`✨`, `${AGE} wishes`, 'Flip all the cards', 'wishes22'],
];

export default function Games() {
  return (
    <>
      <section className="games-hero">
        <h1>Play &amp; celebrate</h1>
        <p>Blow out {NAME}&apos;s candles, pop some balloons and flip the wish cards. Tap anywhere for fireworks 🎆</p>
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
            </button>
          ))}
        </div>
      </section>
      <Cake />
      <Letter />
      <Balloons />
      <Wishes22 />
    </>
  );
}
