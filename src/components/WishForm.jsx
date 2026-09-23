import { useState } from 'react';
import { api } from '../api';
import { NAME } from '../config';

const EMOJIS = ['🎉', '🎂', '🥳', '🎈', '💜', '🌟', '🔥', '🎁'];
export const NOTE_COLORS = ['#ff9fcb', '#ffe08a', '#8ff3ff', '#c9b0ff', '#9dffc4', '#ffb48f'];
const MAX = 280;

export function rememberedName() {
  try {
    return localStorage.getItem('hbd-name') || '';
  } catch {
    return '';
  }
}
export function rememberName(name) {
  try {
    localStorage.setItem('hbd-name', name.trim());
  } catch { /* ignore */ }
}

export default function WishForm({ onDone }) {
  const [name, setName] = useState(rememberedName);
  const [message, setMessage] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState(NOTE_COLORS[0]);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError('Add your name and a wish first 🙂');
      return;
    }
    setSending(true);
    setError('');
    try {
      const wish = await api.addWish({ name, message, emoji, color });
      rememberName(name);
      onDone(wish);
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  return (
    <form className="wish-form" onSubmit={submit} style={{ '--note': color }}>
      <div className="note-preview" style={{ '--note': color }}>
        <span className="note-emoji">{emoji}</span>
        <p className="note-msg">{message || `Happy birthday ${NAME}! …`}</p>
        <footer className="note-foot"><strong>{name || 'Your name'}</strong></footer>
      </div>
      <label className="field">
        <span>Your name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="e.g. Ali" />
      </label>
      <label className="field">
        <span>Your wish</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX}
          rows={3}
          placeholder={`Happy birthday ${NAME}! …`}
        />
        <small className="field-count">{message.length}/{MAX}</small>
      </label>
      <div className="field">
        <span>Sticker</span>
        <div className="chips">
          {EMOJIS.map((em) => (
            <button
              type="button"
              key={em}
              className={`chip ${em === emoji ? 'is-on' : ''}`}
              onClick={() => setEmoji(em)}
              aria-pressed={em === emoji}
            >
              {em}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <span>Note color</span>
        <div className="chips">
          {NOTE_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              className={`swatch ${c === color ? 'is-on' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              aria-pressed={c === color}
            />
          ))}
        </div>
      </div>
      <button className="btn btn-primary btn-block" disabled={sending}>
        {sending ? 'Sending…' : 'Send my wish ✨'}
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
