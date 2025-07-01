// vite.config.ts
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ["lucide-react"],
      include: ["react", "react-dom", "react-router-dom", "framer-motion"],
      force: true
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
      "import.meta.env.DEFAULT_LANGUAGE": JSON.stringify(env.DEFAULT_LANGUAGE || "ru")
    },
    build: {
      sourcemap: true,
      // Enable for debugging
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: false,
          // Keep console logs for debugging
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
      devSourcemap: true
      // Enable for debugging
    },
    cacheDir: ".vite_cache",
    clearScreen: false,
    // Keep console output
    base: "/"
    // Ensure base path is set correctly
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIC8vIExvYWQgZW52IGZpbGUgYmFzZWQgb24gbW9kZVxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKTtcbiAgXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW3JlYWN0KCldLFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICAgIGluY2x1ZGU6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nLCAnZnJhbWVyLW1vdGlvbiddLFxuICAgICAgZm9yY2U6IHRydWVcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgcHJveHk6IHtcbiAgICAgICAgJy9hcGknOiB7XG4gICAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaG1yOiBtb2RlID09PSAncHJvZHVjdGlvbicgPyBmYWxzZSA6IHtcbiAgICAgICAgY2xpZW50UG9ydDogNDQzLFxuICAgICAgICBwcm90b2NvbDogJ3dzcydcbiAgICAgIH0sXG4gICAgfSxcbiAgICBkZWZpbmU6IHtcbiAgICAgIC8vIE1ha2UgZW52IHZhcmlhYmxlcyBhdmFpbGFibGUgdG8gdGhlIGNsaWVudFxuICAgICAgJ2ltcG9ydC5tZXRhLmVudi5BUFBfRU5WJzogSlNPTi5zdHJpbmdpZnkoZW52LkFQUF9FTlYgfHwgJ3Byb2R1Y3Rpb24nKSxcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuRU5BQkxFX0RFQlVHJzogSlNPTi5zdHJpbmdpZnkoZW52LkVOQUJMRV9ERUJVRyA9PT0gJ3RydWUnKSxcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuRElTQUJMRV9QREZfR0VOJzogSlNPTi5zdHJpbmdpZnkoZW52LkRJU0FCTEVfUERGX0dFTiA9PT0gJ3RydWUnKSxcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuREVGQVVMVF9MQU5HVUFHRSc6IEpTT04uc3RyaW5naWZ5KGVudi5ERUZBVUxUX0xBTkdVQUdFIHx8ICdydScpLFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIHNvdXJjZW1hcDogdHJ1ZSwgLy8gRW5hYmxlIGZvciBkZWJ1Z2dpbmdcbiAgICAgIG1pbmlmeTogJ3RlcnNlcicsXG4gICAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICAgIGNvbXByZXNzOiB7XG4gICAgICAgICAgZHJvcF9jb25zb2xlOiBmYWxzZSwgLy8gS2VlcCBjb25zb2xlIGxvZ3MgZm9yIGRlYnVnZ2luZ1xuICAgICAgICAgIGRyb3BfZGVidWdnZXI6IG1vZGUgPT09ICdwcm9kdWN0aW9uJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICAgcmVhY3Q6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXG4gICAgICAgICAgICBmcmFtZXI6IFsnZnJhbWVyLW1vdGlvbiddLFxuICAgICAgICAgICAgc3VwYWJhc2U6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ10sXG4gICAgICAgICAgICByb3V0ZXI6IFsncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgICAgbHVjaWRlOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICAgICAgZW1wdHlPdXREaXI6IHRydWUsXG4gICAgfSxcbiAgICBjc3M6IHtcbiAgICAgIGRldlNvdXJjZW1hcDogdHJ1ZSwgLy8gRW5hYmxlIGZvciBkZWJ1Z2dpbmdcbiAgICB9LFxuICAgIGNhY2hlRGlyOiAnLnZpdGVfY2FjaGUnLFxuICAgIGNsZWFyU2NyZWVuOiBmYWxzZSwgLy8gS2VlcCBjb25zb2xlIG91dHB1dFxuICAgIGJhc2U6ICcvJywgLy8gRW5zdXJlIGJhc2UgcGF0aCBpcyBzZXQgY29ycmVjdGx5XG4gIH07XG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsY0FBYyxlQUFlO0FBQy9QLE9BQU8sV0FBVztBQUdsQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUV4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFFM0MsU0FBTztBQUFBLElBQ0wsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLElBQ2pCLGNBQWM7QUFBQSxNQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsTUFDeEIsU0FBUyxDQUFDLFNBQVMsYUFBYSxvQkFBb0IsZUFBZTtBQUFBLE1BQ25FLE9BQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsVUFDTixRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsUUFDaEI7QUFBQSxNQUNGO0FBQUEsTUFDQSxLQUFLLFNBQVMsZUFBZSxRQUFRO0FBQUEsUUFDbkMsWUFBWTtBQUFBLFFBQ1osVUFBVTtBQUFBLE1BQ1o7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUE7QUFBQSxNQUVOLDJCQUEyQixLQUFLLFVBQVUsSUFBSSxXQUFXLFlBQVk7QUFBQSxNQUNyRSxnQ0FBZ0MsS0FBSyxVQUFVLElBQUksaUJBQWlCLE1BQU07QUFBQSxNQUMxRSxtQ0FBbUMsS0FBSyxVQUFVLElBQUksb0JBQW9CLE1BQU07QUFBQSxNQUNoRixvQ0FBb0MsS0FBSyxVQUFVLElBQUksb0JBQW9CLElBQUk7QUFBQSxJQUNqRjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsV0FBVztBQUFBO0FBQUEsTUFDWCxRQUFRO0FBQUEsTUFDUixlQUFlO0FBQUEsUUFDYixVQUFVO0FBQUEsVUFDUixjQUFjO0FBQUE7QUFBQSxVQUNkLGVBQWUsU0FBUztBQUFBLFFBQzFCO0FBQUEsTUFDRjtBQUFBLE1BQ0EsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sY0FBYztBQUFBLFlBQ1osT0FBTyxDQUFDLFNBQVMsV0FBVztBQUFBLFlBQzVCLFFBQVEsQ0FBQyxlQUFlO0FBQUEsWUFDeEIsVUFBVSxDQUFDLHVCQUF1QjtBQUFBLFlBQ2xDLFFBQVEsQ0FBQyxrQkFBa0I7QUFBQSxZQUMzQixRQUFRLENBQUMsY0FBYztBQUFBLFVBQ3pCO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLHVCQUF1QjtBQUFBLE1BQ3ZCLGFBQWE7QUFBQSxJQUNmO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDSCxjQUFjO0FBQUE7QUFBQSxJQUNoQjtBQUFBLElBQ0EsVUFBVTtBQUFBLElBQ1YsYUFBYTtBQUFBO0FBQUEsSUFDYixNQUFNO0FBQUE7QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
