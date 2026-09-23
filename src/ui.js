import { useEffect, useState } from 'react';

// Themed replacements for alert()/confirm(): toasts and a promise-based dialog.
let state = { toasts: [], dialog: null };
const listeners = new Set();
let nextId = 1;

function set(next) {
  state = { ...state, ...next };
  listeners.forEach((l) => l(state));
}

export function toast(message, tone = 'info') {
  const id = nextId++;
  set({ toasts: [...state.toasts, { id, message, tone }].slice(-3) });
  setTimeout(() => set({ toasts: state.toasts.filter((t) => t.id !== id) }), 4000);
}

export function dialog({ icon = '🎉', title, message, confirmText = 'OK', cancelText = null }) {
  return new Promise((resolve) => {
    state.dialog?.resolve(false);
    set({ dialog: { icon, title, message, confirmText, cancelText, resolve } });
  });
}

export function closeDialog(result) {
  state.dialog?.resolve(result);
  set({ dialog: null });
}

export function usePopups() {
  const [s, setS] = useState(state);
  useEffect(() => {
    listeners.add(setS);
    return () => listeners.delete(setS);
  }, []);
  return s;
}
