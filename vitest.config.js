/**
 * vitest.config.js
 * 
 * Configuration for Vitest — our test runner.
 * 
 * Vitest is designed specifically for Vite projects.
 * It uses the same config and plugins, so there's
 * zero extra setup needed.
 * 
 * Docs: https://vitest.dev/config/
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  test: {
    // Where to find test files
    include: ['tests/**/*.test.js', 'tests/**/*.test.jsx'],

    // Use jsdom so React components can be tested in a browser-like environment
    environment: 'jsdom',

    // Show detailed output for each test
    reporter: 'verbose',
  },
});
