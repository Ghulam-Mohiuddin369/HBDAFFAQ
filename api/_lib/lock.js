import { UNLOCK_AT } from '../../src/config.js';
import { isAdmin } from './http.js';

export const unlockAt = UNLOCK_AT ? Date.parse(UNLOCK_AT) : null;

// Until the unlock moment only the admin can read wishes and memories (posting is always open).
export function isLocked(req) {
  return Boolean(unlockAt) && Date.now() < unlockAt && !isAdmin(req);
}
