import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const spaFallback = () => {
  return {
    name: "spa-fallback",
    apply: "serve",
    enforce: "post",
    configureServer(server: any) {
      return () => {
        server.middlewares.use((req: any, res: any, next: any) => {
          // Allow all other middlewares to process first
          if (req.method !== "GET") {
            return next();
          }

          // Check if this looks like a file request (has extension)
          if (/\.[^/]*$/.test(req.url) || req.url === "/" || req.url.startsWith("/api")) {
            return next();
          }

          // Rewrite to index.html for SPA routing
          req.url = "/";
          next();
        });
      };
    },
  };
};

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "development" && spaFallback(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    include: ["embla-carousel-autoplay"],
  },

  // IMPORTANT: Netlify + SPA safe
  base: "/",
}));
