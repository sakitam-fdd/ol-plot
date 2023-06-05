import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    base: './',
    publicDir: 'public',
    define: {
      'process.env': {
        NODE_ENV: mode,
      },
    },
  }
})
