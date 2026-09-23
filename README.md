# Happy 22nd Birthday, Affaq 🎉

An animated birthday site with an Instagram-style feed where anyone can post **wishes** and **memories** (photos and videos), plus a **Play games** page (candles, balloons, letter, 22 wish cards).

- Frontend: React and Vite
- API: Vercel serverless functions in `/api`
- Data: MongoDB Atlas (`wishes` and `memories` collections)
- Media: Cloudinary. The browser uploads directly using a signature from `/api/upload-signature`, so the secret stays on the server.

## Run locally

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev            # http://localhost:5173. The /api routes run inside the Vite dev server.
```

## Environment variables

| Name | Where to get it |
| --- | --- |
| `MONGODB_URI` | Atlas, then Connect, then Drivers |
| `MONGODB_DB` | Any name, default `hbd_affaq` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary Console, then Settings, then API Keys |
| `ADMIN_KEY` | Any secret string. Visit `/?admin=<key>` once to get delete buttons for moderating posts. |

## Deploy (Vercel + GitHub)

1. In Vercel, click **Add New, then Project** and import this GitHub repo. The Vite preset is detected automatically.
2. Add every variable from the table above under **Settings, then Environment Variables**.
3. In MongoDB Atlas, go to **Network Access** and allow `0.0.0.0/0`. Vercel functions don't have fixed IPs.
4. Deploy. Every push to `main` redeploys automatically.

## Personalize

Edit `src/config.js` to change the birthday date (countdown), the profile handle, bio and avatar, the letter, the 22 wishes and the balloon messages.
