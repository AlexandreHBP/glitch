import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // process.env não é populado automaticamente a partir de .env — isso só
  // acontece para import.meta.env no código cliente. Para ler VITE_* aqui
  // dentro do próprio arquivo de config, é preciso carregar o .env
  // explicitamente com loadEnv (env vars reais do processo, se existirem,
  // continuam tendo prioridade sobre o arquivo).
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };

  return {
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
      allowedHosts: (env.VITE_ALLOWED_HOSTS ?? "localhost,127.0.0.1")
        .split(",")
        .map((host: string) => host.trim())
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
  };
});
