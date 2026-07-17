import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // 🟢 Tell Vite to look in the parent root directory for the .env file
  envDir: path.resolve(__dirname, '../'),
});