import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  // load env variables to read VITE_API_BASE
  const env = loadEnv(mode, process.cwd(), '');
  // If VITE_API_BASE is not provided at build time, default to empty so
  // the frontend uses relative API paths (`/api/v1`) instead of embedding
  // a localhost URL into production builds.
  const backend = env.VITE_API_BASE || '';

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        // Proxy /api to backend to avoid CORS during dev
        '/api': {
          target: backend,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
      },
    },
  });
};
