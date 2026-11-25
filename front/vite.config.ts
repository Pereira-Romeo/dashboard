import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { 
	"/api": process.env.DOCKER ? "http://backend:8080" : "http://localhost:8080" },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
})
