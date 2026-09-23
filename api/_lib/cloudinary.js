import crypto from 'node:crypto';
import { HttpError } from './http.js';

export const FOLDER = 'hbd-affaq';

export function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new HttpError(503, 'Uploads are not configured yet (Cloudinary keys missing)');
  }
  return { cloudName, apiKey, apiSecret };
}

// Cloudinary signature: sorted "k=v&k=v" params followed by the API secret, SHA-1 hashed.
export function sign(params, apiSecret) {
  const payload = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha1').update(payload + apiSecret).digest('hex');
}

export async function destroy(publicId, resourceType) {
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { public_id: publicId, timestamp };
  const body = new URLSearchParams({
    ...params,
    api_key: apiKey,
    signature: sign(params, apiSecret),
  });
  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
    method: 'POST',
    body,
  });
}
