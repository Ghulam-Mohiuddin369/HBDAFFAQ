import { ObjectId } from 'mongodb';
import { route, send, readJson, cleanText, getQuery, isAdmin, HttpError } from './_lib/http.js';
import { getDb, publicDoc } from './_lib/db.js';
import { destroy, FOLDER } from './_lib/cloudinary.js';

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

export default route({
  GET: async (req, res) => {
    const db = await getDb();
    const docs = await db.collection('memories').find({}).sort({ createdAt: -1 }).limit(500).toArray();
    send(res, 200, { memories: docs.map(publicDoc) });
  },

  POST: async (req, res) => {
    const body = await readJson(req);
    const cloud = process.env.CLOUDINARY_CLOUD_NAME;
    const type = body.type === 'video' ? 'video' : 'image';
    const url = cleanText(body.url, 500);
    const publicId = cleanText(body.publicId, 200);
    // Only accept media that was uploaded to our own Cloudinary folder
    if (!cloud || !url.startsWith(`https://res.cloudinary.com/${cloud}/${type}/upload/`)
      || !publicId.startsWith(`${FOLDER}/`)) {
      throw new HttpError(400, 'Invalid upload');
    }
    const doc = {
      name: cleanText(body.name, 40) || 'Someone',
      caption: cleanText(body.caption, 300),
      type,
      url,
      publicId,
      width: num(body.width),
      height: num(body.height),
      duration: num(body.duration),
      createdAt: new Date(),
    };
    const db = await getDb();
    const { insertedId } = await db.collection('memories').insertOne(doc);
    send(res, 201, { memory: publicDoc({ _id: insertedId, ...doc }) });
  },

  DELETE: async (req, res) => {
    if (!isAdmin(req)) throw new HttpError(403, 'Not allowed');
    const { id } = getQuery(req);
    if (!ObjectId.isValid(id)) throw new HttpError(400, 'Bad id');
    const db = await getDb();
    const doc = await db.collection('memories').findOneAndDelete({ _id: new ObjectId(id) });
    if (doc?.publicId) {
      await destroy(doc.publicId, doc.type).catch((err) => console.error('Cloudinary delete failed', err));
    }
    send(res, 200, { ok: true });
  },
});
