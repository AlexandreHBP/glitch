import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { productsApi } from "@/lib/api/products";

/**
 * Sitemap dinâmico do Next.js (App Router). Inclui as rotas estáticas de
 * conteúdo público e, em seguida, uma entrada por produto ativo do
 * catálogo. Páginas privadas/funcionais (carrinho, checkout, conta,
 * login) ficam de fora — são noIndex e bloqueadas em robots.ts.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${siteConfig.url}/produtos`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const { data: products } = await productsApi.list({ limit: 100 }, 3600);
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${siteConfig.url}/produtos/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
    return [...staticRoutes, ...productRoutes];
  } catch {
    // API indisponível no momento do build/revalidate — devolve só as
    // rotas estáticas em vez de quebrar o sitemap inteiro.
    return staticRoutes;
  }
}
