import { route, send, isAdmin } from './_lib/http.js';
import { unlockAt } from './_lib/lock.js';

// Server clock and admin check, so every visitor unlocks at the same real moment.
export default route({
  GET: async (req, res) => {
    send(res, 200, { now: Date.now(), unlockAt, admin: isAdmin(req) });
  },
});
