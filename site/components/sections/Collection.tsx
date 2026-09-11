/**
 * Seção "A Coleção" da home (RF01) — mesma vitrine de "últimas peças" de
 * antes (fetch no servidor, bom para SEO/LCP), agora com o cabeçalho e os
 * filtros de estilo em pílula do mockup de referência. A filtragem em si
 * mora em CollectionFilterPills (client component) — ver comentário lá
 * sobre a limitação dos rótulos de estilo.
 */
import Link from "next/link";
import { CollectionFilterPills } from "@/components/catalog/CollectionFilterPills";
import { productsApi } from "@/lib/api/products";

export async function Collection() {
  const result = await productsApi.list({ limit: 8 }, 60);

  if (result.data.length === 0) {
    return null;
  }

  return (
    <section id="colecao" className="relative border-t border-white/5 py-20 sm:py-28">
      <div className="container-section">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wine-bright">
              Catálogo // Temporada 2026
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase tracking-tight text-bone sm:text-5xl">
              A Coleção
            </h2>
          </div>

          <Link
            href="/produtos"
            className="glitch-hover group inline-flex items-center gap-2 self-start text-sm font-semibold uppercase tracking-wide text-slate-300 transition-colors hover:text-white sm:self-auto"
          >
            Ver tudo
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        <CollectionFilterPills products={result.data} />
      </div>
    </section>
  );
}
