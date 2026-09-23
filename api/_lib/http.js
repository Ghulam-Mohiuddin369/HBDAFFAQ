// Small helpers so the handlers run the same on Vercel and in the Vite dev server.

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

export function getQuery(req) {
  return Object.fromEntries(new URL(req.url, 'http://localhost').searchParams);
}

export async function readJson(req) {
  // Vercel may have parsed the body already
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return req.body ? JSON.parse(req.body) : {};
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 50_000) throw new HttpError(413, 'Request too large');
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new HttpError(400, 'Invalid JSON');
  }
}

export function cleanText(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function isAdmin(req) {
  const key = process.env.ADMIN_KEY;
  return Boolean(key) && req.headers['x-admin-key'] === key;
}

export function route(handlers) {
  return async (req, res) => {
    const handler = handlers[req.method];
    if (!handler) return send(res, 405, { error: 'Method not allowed' });
    try {
      await handler(req, res);
    } catch (err) {
      if (err instanceof HttpError) return send(res, err.status, { error: err.message });
      console.error(err);
      send(res, 500, { error: 'Something went wrong. Please try again.' });
    }
  };
}
