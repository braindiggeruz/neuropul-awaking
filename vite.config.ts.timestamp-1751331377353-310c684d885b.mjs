// vite.config.ts
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ["lucide-react"]
    },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true
        }
      },
      hmr: mode === "production" ? false : {
        clientPort: 443,
        protocol: "wss"
      }
    },
    define: {
      // Make env variables available to the client
      "import.meta.env.APP_ENV": JSON.stringify(env.APP_ENV || "production"),
      "import.meta.env.ENABLE_DEBUG": JSON.stringify(env.ENABLE_DEBUG === "true"),
      "import.meta.env.DISABLE_PDF_GEN": JSON.stringify(env.DISABLE_PDF_GEN === "true"),
      "import.meta.env.DEFAULT_LANGUAGE": JSON.stringify(env.DEFAULT_LANGUAGE || "ru"),
      // Add React Router v7 future flags
      "process.env.ROUTER_FUTURE_FLAGS": JSON.stringify({
        v7_startTransition: true,
        v7_relativeSplatPath: true
      })
    },
    build: {
      sourcemap: false,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === "production",
          drop_debugger: mode === "production"
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            framer: ["framer-motion"],
            supabase: ["@supabase/supabase-js"],
            router: ["react-router-dom"],
            lucide: ["lucide-react"]
          }
        }
      },
      chunkSizeWarningLimit: 1e3,
      emptyOutDir: true
    },
    css: {
      devSourcemap: false
    },
    cacheDir: ".vite_cache"
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIC8vIExvYWQgZW52IGZpbGUgYmFzZWQgb24gbW9kZVxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKTtcbiAgXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW3JlYWN0KCldLFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgcHJveHk6IHtcbiAgICAgICAgJy9hcGknOiB7XG4gICAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaG1yOiBtb2RlID09PSAncHJvZHVjdGlvbicgPyBmYWxzZSA6IHtcbiAgICAgICAgY2xpZW50UG9ydDogNDQzLFxuICAgICAgICBwcm90b2NvbDogJ3dzcydcbiAgICAgIH0sXG4gICAgfSxcbiAgICBkZWZpbmU6IHtcbiAgICAgIC8vIE1ha2UgZW52IHZhcmlhYmxlcyBhdmFpbGFibGUgdG8gdGhlIGNsaWVudFxuICAgICAgJ2ltcG9ydC5tZXRhLmVudi5BUFBfRU5WJzogSlNPTi5zdHJpbmdpZnkoZW52LkFQUF9FTlYgfHwgJ3Byb2R1Y3Rpb24nKSxcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuRU5BQkxFX0RFQlVHJzogSlNPTi5zdHJpbmdpZnkoZW52LkVOQUJMRV9ERUJVRyA9PT0gJ3RydWUnKSxcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuRElTQUJMRV9QREZfR0VOJzogSlNPTi5zdHJpbmdpZnkoZW52LkRJU0FCTEVfUERGX0dFTiA9PT0gJ3RydWUnKSxcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuREVGQVVMVF9MQU5HVUFHRSc6IEpTT04uc3RyaW5naWZ5KGVudi5ERUZBVUxUX0xBTkdVQUdFIHx8ICdydScpLFxuICAgICAgLy8gQWRkIFJlYWN0IFJvdXRlciB2NyBmdXR1cmUgZmxhZ3NcbiAgICAgICdwcm9jZXNzLmVudi5ST1VURVJfRlVUVVJFX0ZMQUdTJzogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICB2N19zdGFydFRyYW5zaXRpb246IHRydWUsXG4gICAgICAgIHY3X3JlbGF0aXZlU3BsYXRQYXRoOiB0cnVlXG4gICAgICB9KVxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgICBtaW5pZnk6ICd0ZXJzZXInLFxuICAgICAgdGVyc2VyT3B0aW9uczoge1xuICAgICAgICBjb21wcmVzczoge1xuICAgICAgICAgIGRyb3BfY29uc29sZTogbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nLFxuICAgICAgICAgIGRyb3BfZGVidWdnZXI6IG1vZGUgPT09ICdwcm9kdWN0aW9uJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICAgcmVhY3Q6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXG4gICAgICAgICAgICBmcmFtZXI6IFsnZnJhbWVyLW1vdGlvbiddLFxuICAgICAgICAgICAgc3VwYWJhc2U6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ10sXG4gICAgICAgICAgICByb3V0ZXI6IFsncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgICAgbHVjaWRlOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICAgICAgZW1wdHlPdXREaXI6IHRydWUsXG4gICAgfSxcbiAgICBjc3M6IHtcbiAgICAgIGRldlNvdXJjZW1hcDogZmFsc2UsXG4gICAgfSxcbiAgICBjYWNoZURpcjogJy52aXRlX2NhY2hlJyxcbiAgfTtcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxjQUFjLGVBQWU7QUFDL1AsT0FBTyxXQUFXO0FBR2xCLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBRXhDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUUzQyxTQUFPO0FBQUEsSUFDTCxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsSUFDakIsY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxJQUMxQjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0wsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFFBQ2hCO0FBQUEsTUFDRjtBQUFBLE1BQ0EsS0FBSyxTQUFTLGVBQWUsUUFBUTtBQUFBLFFBQ25DLFlBQVk7QUFBQSxRQUNaLFVBQVU7QUFBQSxNQUNaO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBO0FBQUEsTUFFTiwyQkFBMkIsS0FBSyxVQUFVLElBQUksV0FBVyxZQUFZO0FBQUEsTUFDckUsZ0NBQWdDLEtBQUssVUFBVSxJQUFJLGlCQUFpQixNQUFNO0FBQUEsTUFDMUUsbUNBQW1DLEtBQUssVUFBVSxJQUFJLG9CQUFvQixNQUFNO0FBQUEsTUFDaEYsb0NBQW9DLEtBQUssVUFBVSxJQUFJLG9CQUFvQixJQUFJO0FBQUE7QUFBQSxNQUUvRSxtQ0FBbUMsS0FBSyxVQUFVO0FBQUEsUUFDaEQsb0JBQW9CO0FBQUEsUUFDcEIsc0JBQXNCO0FBQUEsTUFDeEIsQ0FBQztBQUFBLElBQ0g7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFdBQVc7QUFBQSxNQUNYLFFBQVE7QUFBQSxNQUNSLGVBQWU7QUFBQSxRQUNiLFVBQVU7QUFBQSxVQUNSLGNBQWMsU0FBUztBQUFBLFVBQ3ZCLGVBQWUsU0FBUztBQUFBLFFBQzFCO0FBQUEsTUFDRjtBQUFBLE1BQ0EsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sY0FBYztBQUFBLFlBQ1osT0FBTyxDQUFDLFNBQVMsV0FBVztBQUFBLFlBQzVCLFFBQVEsQ0FBQyxlQUFlO0FBQUEsWUFDeEIsVUFBVSxDQUFDLHVCQUF1QjtBQUFBLFlBQ2xDLFFBQVEsQ0FBQyxrQkFBa0I7QUFBQSxZQUMzQixRQUFRLENBQUMsY0FBYztBQUFBLFVBQ3pCO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLHVCQUF1QjtBQUFBLE1BQ3ZCLGFBQWE7QUFBQSxJQUNmO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDSCxjQUFjO0FBQUEsSUFDaEI7QUFBQSxJQUNBLFVBQVU7QUFBQSxFQUNaO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
