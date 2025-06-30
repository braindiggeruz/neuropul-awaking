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
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIC8vIExvYWQgZW52IGZpbGUgYmFzZWQgb24gbW9kZVxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKTtcbiAgXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW3JlYWN0KCldLFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgcHJveHk6IHtcbiAgICAgICAgJy9hcGknOiB7XG4gICAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICAvLyBNYWtlIGVudiB2YXJpYWJsZXMgYXZhaWxhYmxlIHRvIHRoZSBjbGllbnRcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuQVBQX0VOVic6IEpTT04uc3RyaW5naWZ5KGVudi5BUFBfRU5WIHx8ICdwcm9kdWN0aW9uJyksXG4gICAgICAnaW1wb3J0Lm1ldGEuZW52LkVOQUJMRV9ERUJVRyc6IEpTT04uc3RyaW5naWZ5KGVudi5FTkFCTEVfREVCVUcgPT09ICd0cnVlJyksXG4gICAgICAnaW1wb3J0Lm1ldGEuZW52LkRJU0FCTEVfUERGX0dFTic6IEpTT04uc3RyaW5naWZ5KGVudi5ESVNBQkxFX1BERl9HRU4gPT09ICd0cnVlJyksXG4gICAgICAnaW1wb3J0Lm1ldGEuZW52LkRFRkFVTFRfTEFOR1VBR0UnOiBKU09OLnN0cmluZ2lmeShlbnYuREVGQVVMVF9MQU5HVUFHRSB8fCAncnUnKSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgICAgbWluaWZ5OiAndGVyc2VyJyxcbiAgICAgIHRlcnNlck9wdGlvbnM6IHtcbiAgICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgICBkcm9wX2NvbnNvbGU6IG1vZGUgPT09ICdwcm9kdWN0aW9uJyxcbiAgICAgICAgICBkcm9wX2RlYnVnZ2VyOiBtb2RlID09PSAncHJvZHVjdGlvbicsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgIHJlYWN0OiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgICAgZnJhbWVyOiBbJ2ZyYW1lci1tb3Rpb24nXSxcbiAgICAgICAgICAgIHN1cGFiYXNlOiBbJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyddLFxuICAgICAgICAgICAgcm91dGVyOiBbJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAgIGx1Y2lkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLGNBQWMsZUFBZTtBQUMvUCxPQUFPLFdBQVc7QUFHbEIsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFFeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBRTNDLFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxJQUNqQixjQUFjO0FBQUEsTUFDWixTQUFTLENBQUMsY0FBYztBQUFBLElBQzFCO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsVUFDTixRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsUUFDaEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBO0FBQUEsTUFFTiwyQkFBMkIsS0FBSyxVQUFVLElBQUksV0FBVyxZQUFZO0FBQUEsTUFDckUsZ0NBQWdDLEtBQUssVUFBVSxJQUFJLGlCQUFpQixNQUFNO0FBQUEsTUFDMUUsbUNBQW1DLEtBQUssVUFBVSxJQUFJLG9CQUFvQixNQUFNO0FBQUEsTUFDaEYsb0NBQW9DLEtBQUssVUFBVSxJQUFJLG9CQUFvQixJQUFJO0FBQUEsSUFDakY7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFdBQVc7QUFBQSxNQUNYLFFBQVE7QUFBQSxNQUNSLGVBQWU7QUFBQSxRQUNiLFVBQVU7QUFBQSxVQUNSLGNBQWMsU0FBUztBQUFBLFVBQ3ZCLGVBQWUsU0FBUztBQUFBLFFBQzFCO0FBQUEsTUFDRjtBQUFBLE1BQ0EsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sY0FBYztBQUFBLFlBQ1osT0FBTyxDQUFDLFNBQVMsV0FBVztBQUFBLFlBQzVCLFFBQVEsQ0FBQyxlQUFlO0FBQUEsWUFDeEIsVUFBVSxDQUFDLHVCQUF1QjtBQUFBLFlBQ2xDLFFBQVEsQ0FBQyxrQkFBa0I7QUFBQSxZQUMzQixRQUFRLENBQUMsY0FBYztBQUFBLFVBQ3pCO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
