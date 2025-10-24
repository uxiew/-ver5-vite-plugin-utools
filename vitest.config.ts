import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    root: __dirname,
    include: ['test/**/*.test.ts'],
    alias: {
      '@src': resolve(__dirname, 'src'),
    },
  },
});
