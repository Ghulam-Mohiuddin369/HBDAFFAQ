import { ObjectId } from 'mongodb';
import { route, send, readJson, cleanText, getQuery, isAdmin, HttpError } from './_lib/http.js';
import { getDb, publicDoc } from './_lib/db.js';
import { isLocked } from './_lib/lock.js';

export default route({
  GET: async (req, res) => {
    if (isLocked(req)) return send(res, 200, { wishes: [], locked: true });
    const db = await getDb();
    const docs = await db.collection('wishes').find({}).sort({ createdAt: -1 }).limit(500).toArray();
    send(res, 200, { wishes: docs.map(publicDoc) });
  },

  POST: async (req, res) => {
    const body = await readJson(req);
    const name = cleanText(body.name, 40);
    const message = cleanText(body.message, 280);
    if (!name || !message) throw new HttpError(400, 'Please add your name and a wish');
    const doc = {
      name,
      message,
      emoji: cleanText(body.emoji, 8) || '🎉',
      color: /^#[0-9a-f]{6}$/i.test(body.color) ? body.color : '#ff9fcb',
      createdAt: new Date(),
    };
    const db = await getDb();
    const { insertedId } = await db.collection('wishes').insertOne(doc);
    send(res, 201, { wish: publicDoc({ _id: insertedId, ...doc }) });
  },

  DELETE: async (req, res) => {
    if (!isAdmin(req)) throw new HttpError(403, 'Not allowed');
    const { id } = getQuery(req);
    if (!ObjectId.isValid(id)) throw new HttpError(400, 'Bad id');
    const db = await getDb();
    await db.collection('wishes').deleteOne({ _id: new ObjectId(id) });
    send(res, 200, { ok: true });
  },
});
