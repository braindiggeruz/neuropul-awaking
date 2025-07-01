import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
      hmr: mode === 'production' ? false : {
        clientPort: 443,
        protocol: 'wss'
      },
    },
    define: {
      // Make env variables available to the client
      'import.meta.env.APP_ENV': JSON.stringify(env.APP_ENV || 'production'),
      'import.meta.env.ENABLE_DEBUG': JSON.stringify(env.ENABLE_DEBUG === 'true'),
      'import.meta.env.DISABLE_PDF_GEN': JSON.stringify(env.DISABLE_PDF_GEN === 'true'),
      'import.meta.env.DEFAULT_LANGUAGE': JSON.stringify(env.DEFAULT_LANGUAGE || 'ru'),
      // Add React Router v7 future flags
      'process.env.ROUTER_FUTURE_FLAGS': JSON.stringify({
        v7_startTransition: true,
        v7_relativeSplatPath: true
      })
    },
    build: {
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            framer: ['framer-motion'],
            supabase: ['@supabase/supabase-js'],
            router: ['react-router-dom'],
            lucide: ['lucide-react'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      emptyOutDir: true,
    },
    css: {
      devSourcemap: false,
    },
    cacheDir: '.vite_cache',
  };
});