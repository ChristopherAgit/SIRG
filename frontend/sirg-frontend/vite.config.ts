import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  // load env variables to read VITE_API_BASE
  const env = loadEnv(mode, process.cwd(), '');
  const backend = env.VITE_API_BASE || 'https://localhost:7278';

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
