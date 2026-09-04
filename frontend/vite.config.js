import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  // strictPort: fail loudly if 5173 is taken instead of silently moving to
  // 5174 — the backend CORS allowlist is keyed to the origin, and a drifted
  // port means every API call dies at the preflight with no clear error.
  server: { port: 5173, strictPort: true },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
