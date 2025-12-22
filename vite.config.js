import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'https://pyramidally-unborrowed-cherie.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
          });
        }
      }
    }
  },
});
