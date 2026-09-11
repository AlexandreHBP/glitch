import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    // Lista explícita de hosts permitidos — `true` desligava a proteção
    // do Vite contra DNS rebinding (um site malicioso resolvendo para
    // 127.0.0.1 e falando com o dev server como se fosse same-origin,
    // contornando a allowlist de CORS do backend). Configurável via env
    // var para ambientes de teste atrás de um ingress/domínio próprio.
    allowedHosts: (process.env.VITE_ALLOWED_HOSTS ?? "localhost,127.0.0.1")
      .split(",")
      .map((host) => host.trim())
      .filter(Boolean),
    // Proxy inerte em uso normal (VITE_API_URL é absoluto por padrão, ver
    // .env.example). Só entra em ação se VITE_API_URL for definido como
    // caminho relativo (ex.: atrás de um reverse proxy que expõe frontend
    // e backend na mesma origem) — evita problemas de CORS nesse cenário.
    proxy: {
      "/api": { target: "http://localhost:3000", changeOrigin: true },
      "/uploads": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
});
