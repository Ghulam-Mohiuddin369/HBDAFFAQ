import Cake from './Cake';
import Balloons from './Balloons';
import Wishes22 from './Wishes22';
import Locked from './Locked';
import PageHeader from './PageHeader';
import { AGE } from '../config';
import Icon from './Icon';

export const GAMES = [
  ['cake', 'Blow the candles', `${AGE} candles, one wish`, 'cake'],
  ['balloon', 'Pop balloons', 'Each hides a message', 'balloons'],
  ['sparkles', `${AGE} wishes`, 'Flip all the cards', 'wishes22'],
];

export default function Games({ lock }) {
  return (
    <>
      <PageHeader title="Play & celebrate" />
      <div className="game-menu">
        {GAMES.map(([emoji, title, sub, id], i) => (
          <button
            key={id}
            className="game-card"
            style={{ '--i': i }}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="game-icon"><Icon name={emoji} size={26} strokeWidth={1.8} /></span>
            <strong>{title}</strong>
            <small>{sub}</small>
            {!lock.open && <em className="game-lock"><Icon name="lock" size={12} /> Locked</em>}
          </button>
        ))}
      </div>
      <Locked lock={lock} label="The cake gets lit in"><Cake /></Locked>
      <Locked lock={lock} label="Balloons release in"><Balloons /></Locked>
      <Locked lock={lock} label={`The ${AGE} wishes unlock in`}><Wishes22 /></Locked>
    </>
  );
}
