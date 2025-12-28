import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || 'https://brbqhbghvuhvmelmvoyx.supabase.co'),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyYnFoYmdodnVodm1lbG12b3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODEyNDgsImV4cCI6MjA4MjQ1NzI0OH0.BqIuqdYUhsAvRWnf57Xro_TjpLikFG4Urcoj0NIFkOs'),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild'
    },
    server: {
      port: 5173,
      host: true
    }
  };
});