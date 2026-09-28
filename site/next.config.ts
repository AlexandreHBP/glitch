import type { NextConfig } from "next";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// A plataforma de hospedagem injeta valores genéricos de algumas variáveis
// NEXT_PUBLIC_* diretamente no ambiente (ex.: NEXT_PUBLIC_SITE_NAME="My LP"),
// e o Next.js nunca sobrescreve uma variável já definida no processo com o
// valor de .env.local — então o nome genérico "vencia" o nome real da marca.
// Sobrescrevemos aqui manualmente só as chaves abaixo, lidas diretamente do
// .env.local do projeto, antes de qualquer código da aplicação rodar.
function overrideFromEnvLocal(keys: string[]) {
  const envLocalPath = join(process.cwd(), ".env.local");
  if (!existsSync(envLocalPath)) return;
  const contents = readFileSync(envLocalPath, "utf8");
  for (const line of contents.split("\n")) {
    const match = /^([\w.-]+)\s*=\s*(.*)$/.exec(line.trim());
    if (!match) continue;
    const [, key, rawValue] = match;
    if (!keys.includes(key)) continue;
    process.env[key] = rawValue.trim().replace(/^(['"])(.*)\1$/, "$2");
  }
}

overrideFromEnvLocal(["NEXT_PUBLIC_SITE_NAME"]);

// Fotos de produto vêm do backend (uploads servidos na raiz, fora do
// prefixo /api/v1 — ver lib/media.ts). O hostname permitido no otimizador
// de imagem do Next é derivado da própria env var da API — nunca um
// curinga — para evitar SSRF via /_next/image (o otimizador faz fetch
// server-side de qualquer host que a política liberar).
const backendUrl = new URL(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1",
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  // standalone: empacota apenas os arquivos mínimos para produção em
  // .next/standalone — essencial para imagens Docker enxutas (~150 MB).
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: backendUrl.protocol.replace(":", "") as "http" | "https",
        hostname: backendUrl.hostname,
        port: backendUrl.port,
        pathname: "/uploads/**",
      },
    ],
  },
  async headers() {
    // CSP em modo Report-Only (não bloqueia nada ainda — só reporta
    // violações) como segunda camada de defesa para o JWT do cliente, que
    // vive em localStorage (ver contexts/AuthContext.tsx). Uma vez validado
    // em produção sem falsos positivos, trocar para
    // "Content-Security-Policy" (enforcement).
    const connectSrc = ["'self'", `${backendUrl.protocol}//${backendUrl.host}`].join(" ");
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      `connect-src ${connectSrc} https://www.google-analytics.com`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    const securityHeaders = [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "Content-Security-Policy-Report-Only", value: csp },
    ];

    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
