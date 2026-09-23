import { MongoClient } from 'mongodb';
import { HttpError } from './http.js';

// Reuse one connection across invocations of a warm serverless function.
export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new HttpError(500, 'MONGODB_URI is not configured');
  if (!globalThis._mongoClient) {
    globalThis._mongoClient = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 })
      .connect()
      .catch((err) => {
        globalThis._mongoClient = null;
        throw err;
      });
  }
  const client = await globalThis._mongoClient;
  return client.db(process.env.MONGODB_DB || 'hbd_affaq');
}

export function publicDoc({ _id, ...rest }) {
  return { id: String(_id), ...rest, createdAt: rest.createdAt?.getTime?.() ?? Date.now() };
}
