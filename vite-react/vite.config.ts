import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: ["vite-react", "localhost"],
    proxy: {
      "/lab": {
        target: "http://flask:5002",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "http://flask:5002",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
