import { useState } from 'react';
import { music } from '../music';

export default function MusicToggle() {
  const [on, setOn] = useState(music.playing);

  function toggle() {
    if (music.playing) music.stop();
    else music.start();
    setOn(music.playing);
  }

  return (
    <button className={`music-toggle ${on ? 'is-on' : ''}`} onClick={toggle} aria-label={on ? 'Mute music' : 'Play music'}>
      <span className="vinyl" />
      <span className="music-label">{on ? '♫ On' : '♪ Off'}</span>
    </button>
  );
}
