import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: "spotify",
  server: {
    port: 8000,
    strictPort: true,
    host: true,
  },
  plugins: [],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
