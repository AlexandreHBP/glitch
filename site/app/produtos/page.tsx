/**
 * Catálogo (RF01) — grade responsiva e paginada, com filtro por categoria
 * e busca. Fetch inicial no servidor (bom para SEO); os filtros são
 * aplicados via query params, então a própria navegação (Link/router.push)
 * já refaz o fetch no servidor a cada mudança.
 */
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductFilters } from "@/components/catalog/ProductFilters";
import { Pagination } from "@/components/catalog/Pagination";
import { GlitchText } from "@/components/glitch/GlitchText";

export const metadata: Metadata = buildMetadata({
  title: "Catálogo",
  description: "Camisetas, moletons e acessórios da Glitch. Veja tamanhos, cores e estoque em tempo real.",
  path: "/produtos",
});

const PAGE_SIZE = 12;

type CatalogPageProps = {
  searchParams: Promise<{ pagina?: string; categoria?: string; busca?: string }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.pagina ?? "1") || 1;
  const categoryId = resolvedParams.categoria;
  const search = resolvedParams.busca;

  const [productsResult, categories] = await Promise.all([
    productsApi.list({ page, limit: PAGE_SIZE, categoryId, search }, 15),
    categoriesApi.list(),
  ]);

  return (
    <div className="container-section py-16 sm:py-20">
      <header className="mb-10 max-w-2xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-wine-bright">Catálogo</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <GlitchText as="span" intensity="subtle">
            Peças pra quem não segue o padrão
          </GlitchText>
        </h1>
        <p className="mt-4 text-base text-slate-400">
          {productsResult.total} {productsResult.total === 1 ? "produto disponível" : "produtos disponíveis"}.
          Escolha tamanho e cor na página de cada peça — o estoque é exibido por variação.
        </p>
      </header>

      <ProductFilters categories={categories} />

      {productsResult.data.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
          <p className="text-lg font-semibold text-white">Nenhum produto encontrado</p>
          <p className="mt-2 text-sm text-slate-400">
            Tente outra busca ou remova o filtro de categoria.
          </p>
        </div>
      ) : (
        <ul role="list" className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {productsResult.data.map((product, index) => (
            <li key={product.id}>
              <ProductCard product={product} priority={index < 4} />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={productsResult.page}
        totalPages={productsResult.totalPages}
        basePath="/produtos"
        searchParams={{ categoria: categoryId, busca: search }}
      />
    </div>
  );
}
