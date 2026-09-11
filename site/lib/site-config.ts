/**
 * Single source of truth para metadados do site.
 * Importe daqui sempre que precisar de URL canônica, nome da marca,
 * locale ou identificadores de SEO. Evita strings espalhadas pelo código.
 */
// Usamos `||` (e não `??`) para também cair na default quando a env vier
// como string vazia — caso comum em Dockerfiles que declaram `ENV X=${ARG}`
// sem `--build-arg` correspondente.
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Glitch",
  shortName: "Glitch",
  // Wordmark estilizado do logo (header/footer), com o "I" trocado por "1"
  // — efeito "hacker/alternativo" do mockup de referência. Usado só na
  // marca visual (GlitchText); nome da marca em copy/metadados continua
  // "Glitch" (`siteConfig.name`), sem o "1".
  wordmark: "GL1TCH",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3001",
  description:
    "Glitch é uma loja de roupas com estética alternativa: catálogo com tamanhos e cores, conta de cliente, pedido direto pelo site e pagamento combinado com o vendedor.",
  tagline: "Roupa com falha de propósito.",
  locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "pt_BR",
  language: "pt-BR",
  keywords: [
    "glitch",
    "loja alternativa",
    "streetwear",
    "roupa underground",
    "moda alternativa",
    "camiseta glitch",
    "moletom",
  ],
  authors: [{ name: "Glitch", url: "http://localhost:3001" }],
  creator: "Glitch",
  publisher: "Glitch",
  themeColor: "#670001",
  // TODO(Alexandre): tiktok/discord/youtube abaixo estão com links
  // genéricos de placeholder (não são os perfis reais da loja) — troque
  // pelos handles/convites reais assim que existirem. Usados nos ícones
  // sociais do rodapé (mockup de referência mostra IG/TK/DC/YT).
  social: {
    twitter: "@glitch",
    linkedin: "",
    github: "",
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    discord: "https://discord.com",
    youtube: "https://youtube.com",
  },
  contact: {
    email: "contato@glitch.com.br",
    phone: "+55 11 0000-0000",
  },
  ogImage: "/og-image.png",
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
  },
  analytics: {
    /** Measurement ID do GA4 (formato G-XXXXXXX). Vazio em dev/preview. */
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID ?? "",
    /** Container ID do GTM (formato GTM-XXXXXXX). Vazio em dev/preview. */
    googleTagManagerId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
