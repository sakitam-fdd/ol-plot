import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    // base: BASE_URL,
    publicDir: 'public',
    define: {
      'process.env': {
        NODE_ENV: mode,
      },
    },
  }
})
