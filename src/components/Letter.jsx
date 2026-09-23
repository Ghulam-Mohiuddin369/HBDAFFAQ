import { useEffect, useState } from 'react';
import { FROM, LETTER } from '../config';
import { useReveal } from '../useReveal';
import Icon from './Icon';

const FULL = LETTER.join('\n');

// An envelope that opens when scrolled into view, then types the letter out.
export default function Letter() {
  const [ref, visible] = useReveal(0.35);
  const [open, setOpen] = useState(false);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (!visible) return undefined;
    const t = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(t);
  }, [visible]);

  useEffect(() => {
    if (!open || chars >= FULL.length) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setChars(reduce ? FULL.length : chars + 2), chars === 0 ? 1300 : 22);
    return () => clearTimeout(t);
  }, [open, chars]);

  const done = chars >= FULL.length;
  const paragraphs = FULL.slice(0, chars).split('\n');

  return (
    <section id="letter" className="section letter-section" ref={ref}>
      <h2 className="section-title">A letter for you</h2>
      <div
        className={`envelope ${open ? 'is-open' : ''}`}
        onClick={() => (open ? setChars(FULL.length) : setOpen(true))}
      >
        <div className="envelope-back" />
        <div className="letter-paper">
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? 'letter-greeting' : ''}>
              {p}
              {i === paragraphs.length - 1 && !done && <span className="caret" />}
            </p>
          ))}
          {done && <p className="letter-sign">With love, {FROM}</p>}
        </div>
        <div className="envelope-front" />
        <div className="envelope-flap" />
        <div className="envelope-seal"><Icon name="heart" size={22} /></div>
      </div>
      {open && !done && <p className="letter-skip">Tap the letter to skip ahead</p>}
    </section>
  );
}
