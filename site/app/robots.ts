import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * robots.txt dinâmico. Bloqueia /api, internos do Next e as páginas
 * privadas/funcionais da loja (carrinho, checkout, conta, login/cadastro)
 * — todas já marcadas noIndex em buildMetadata().
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/admin/",
          "/carrinho",
          "/checkout",
          "/entrar",
          "/cadastro",
          "/minha-conta",
          "/pedido-confirmado",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
