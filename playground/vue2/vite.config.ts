import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  publicDir: 'public',
  // server: {
  //   port: 8081,
  // },
  define: {
    'process.env': {
      NODE_ENV: mode,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/ol/')) return 'openlayers';
          if (id.includes('/packages/ol-plot')) return 'ol-plot';
          if (id.includes('/node_modules/vue') || id.includes('/node_modules/.pnpm/vue')) return 'vue';
          return undefined;
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['vue-demi'],
  },
}));
