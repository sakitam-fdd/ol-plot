import { defineConfig } from 'vite';
import { createVuePlugin } from 'vite-plugin-vue2';

export default defineConfig(({ mode }) => ({
  plugins: [createVuePlugin()],
  publicDir: 'public',
  // server: {
  //   port: 8081,
  // },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm.js',
    },
  },
  define: {
    'process.env': {
      NODE_ENV: mode,
    },
  },
  optimizeDeps: {
    exclude: ['vue-demi'],
  },
}));
