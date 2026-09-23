import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, serve the /api/*.js serverless functions from the Vite server (Vercel runs them in production).
function devApi() {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();
        const name = req.url.split('?')[0].slice('/api/'.length);
        if (!/^[a-z-]+$/.test(name)) return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.js`);
          await mod.default(req, res);
        } catch (err) {
          console.error(err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Dev API error' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // expose server-side secrets from .env to the dev API (not to the browser bundle)
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    plugins: [react(), devApi()],
  };
});
