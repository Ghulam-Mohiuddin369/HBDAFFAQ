import { useEffect, useState } from 'react';
import { UNLOCK_AT } from './config';
import { adminKey } from './api';

const target = UNLOCK_AT ? Date.parse(UNLOCK_AT) : NaN;
export const unlockDate = Number.isNaN(target) ? null : new Date(target);

// { open, left (ms), admin, date }. Uses the server clock so everyone unlocks at the same moment,
// and lets a verified admin preview everything early.
export function useUnlock() {
  const [offset, setOffset] = useState(0);
  const [admin, setAdmin] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!unlockDate && !adminKey) return;
    fetch('/api/status', { headers: adminKey ? { 'x-admin-key': adminKey } : {} })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setOffset(d.now - Date.now());
        setAdmin(Boolean(d.admin));
      })
      .catch(() => {});
  }, []);

  const left = unlockDate ? Math.max(0, unlockDate.getTime() - (now + offset)) : 0;
  const ticking = left > 0;

  useEffect(() => {
    if (!ticking) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [ticking]);

  // isAdmin: key verified by the server. admin: previewing while still locked for everyone else.
  return { open: !ticking || admin, left, admin: admin && ticking, isAdmin: admin, date: unlockDate };
}

export function formatUnlock(date) {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
