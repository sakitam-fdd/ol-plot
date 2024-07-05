import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  base: './',
  publicDir: 'public',
  define: {
    'process.env': {
      NODE_ENV: mode,
    },
  },
  optimizeDeps: {
    include: [],
    exclude: ['ol-plot'],
  },
}));
