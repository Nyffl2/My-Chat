import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Use the provided key if env var is missing
  const apiKey = env.API_KEY || process.env.API_KEY || 'AIzaSyA8lcdTGAHXJd8ko9Y9RaLHbkD47JYwvRQ';
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  };
});