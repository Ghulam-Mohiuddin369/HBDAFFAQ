import { useCallback, useEffect, useRef, useState } from 'react';

// Admin mode: open the site once with ?admin=<ADMIN_KEY> to get delete buttons.
function readAdminKey() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('admin');
    if (fromUrl) {
      localStorage.setItem('hbd-admin', fromUrl);
      window.history.replaceState(null, '', window.location.pathname);
    }
    return localStorage.getItem('hbd-admin') || '';
  } catch {
    return '';
  }
}
export const adminKey = readAdminKey();

async function request(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(adminKey ? { 'x-admin-key': adminKey } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  wishes: () => request('/api/wishes').then((d) => d.wishes),
  memories: () => request('/api/memories').then((d) => d.memories),
  addWish: (wish) => request('/api/wishes', { method: 'POST', body: JSON.stringify(wish) }).then((d) => d.wish),
  addMemory: (m) => request('/api/memories', { method: 'POST', body: JSON.stringify(m) }).then((d) => d.memory),
  remove: (kind, id) => request(`/api/${kind}?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

// Uploads a file straight to Cloudinary with a server-issued signature. Reports 0..1 progress.
export async function uploadMedia(file, onProgress) {
  const sig = await request('/api/upload-signature', { method: 'POST' });
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', sig.timestamp);
  form.append('folder', sig.folder);
  form.append('signature', sig.signature);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch { /* ignore */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error(data.error?.message || 'Upload failed'));
    };
    xhr.onerror = () => reject(new Error('Network error while uploading'));
    xhr.send(form);
  });
}

// Cloudinary URL transforms for thumbnails and posters
export function mediaUrl(url, transform) {
  return url.replace('/upload/', `/upload/${transform}/`);
}
export function videoPoster(url, transform = 'so_0,c_fill,w_600,h_600,q_auto') {
  return mediaUrl(url, transform).replace(/\.[a-z0-9]+$/i, '.jpg');
}

// Loads a list and keeps polling it so new posts from other visitors show up.
export function useLiveList(fetcher, intervalMs = 15000) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [fresh, setFresh] = useState(() => new Set());
  const seen = useRef(null);

  const load = useCallback(async () => {
    try {
      const list = await fetcher();
      if (seen.current) {
        const incoming = list.filter((x) => !seen.current.has(x.id)).map((x) => x.id);
        if (incoming.length) setFresh((prev) => new Set([...prev, ...incoming]));
      }
      seen.current = new Set(list.map((x) => x.id));
      setItems(list);
      setStatus('ready');
    } catch {
      setStatus((s) => (s === 'ready' ? s : 'error'));
    }
  }, [fetcher]);

  useEffect(() => {
    load();
    const id = setInterval(() => document.visibilityState === 'visible' && load(), intervalMs);
    return () => clearInterval(id);
  }, [load, intervalMs]);

  // Optimistically show the visitor's own post right away
  const prepend = useCallback((item) => {
    seen.current?.add(item.id);
    setItems((list) => [item, ...list.filter((x) => x.id !== item.id)]);
  }, []);
  const removeLocal = useCallback((id) => setItems((list) => list.filter((x) => x.id !== id)), []);

  return { items, status, fresh, reload: load, prepend, removeLocal };
}
