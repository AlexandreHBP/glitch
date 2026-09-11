"use client";

/**
 * Filtros em "pílula" da seção "A Coleção" da home (mockup de referência).
 * IMPORTANTE: estes rótulos (fluido de gênero, unissex, corte adaptável,
 * todos os corpos, lançamento) são atributos de ESTILO — diferentes das
 * categorias reais de produto cadastradas no backend (Camisetas, Moletons,
 * Acessórios...). Ainda não existe um campo de atributo no catálogo para
 * filtrar de verdade por isso, então aqui filtramos por aproximação (texto
 * do nome/descrição do produto). Se a aproximação não encontrar nenhuma
 * peça, mostramos a coleção inteira com um aviso, em vez de uma grade
 * vazia. Uma filtragem real exigiria um campo novo no backend (migração) —
 * decisão maior que deve ser confirmada com o Alexandre antes de ser feita.
 */
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

type FilterDef = {
  id: string;
  label: string;
  keywords: string[];
};

const FILTERS: FilterDef[] = [
  { id: "todos", label: "Todos", keywords: [] },
  { id: "fluido-genero", label: "Fluido de gênero", keywords: ["fluido"] },
  { id: "unissex", label: "Unissex", keywords: ["unissex"] },
  { id: "corte-adaptavel", label: "Corte adaptável", keywords: ["adaptavel", "adaptado"] },
  { id: "todos-corpos", label: "Todos os corpos", keywords: ["todo corpo", "todos os corpos", "plus", "curva"] },
  { id: "lancamento", label: "Lançamento", keywords: ["lancamento", "novidade", "new"] },
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function CollectionFilterPills({ products }: { products: Product[] }) {
  const [activeId, setActiveId] = useState<string>("todos");

  const { list, isFallback } = useMemo(() => {
    if (activeId === "todos") return { list: products, isFallback: false };
    const filter = FILTERS.find((item) => item.id === activeId);
    if (!filter || filter.keywords.length === 0) return { list: products, isFallback: false };

    const matches = products.filter((product) => {
      const haystack = normalize(`${product.name} ${product.description ?? ""}`);
      return filter.keywords.some((keyword) => haystack.includes(normalize(keyword)));
    });

    return matches.length > 0 ? { list: matches, isFallback: false } : { list: products, isFallback: true };
  }, [activeId, products]);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar coleção por estilo">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActiveId(filter.id)}
            aria-pressed={activeId === filter.id}
            className={cn(
              "rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wide transition sm:text-sm",
              activeId === filter.id ? "bg-wine text-bone" : "bg-white/5 text-slate-300 hover:bg-white/10",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isFallback && (
        <p className="mt-4 text-xs text-slate-500">
          Esse filtro de estilo ainda não está mapeado nas peças do catálogo — mostrando toda a coleção.
        </p>
      )}

      {list.length === 0 ? (
        <p className="mt-10 text-sm text-slate-400">Nenhum produto disponível no momento.</p>
      ) : (
        <ul role="list" className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {list.map((product, index) => (
            <li key={product.id}>
              <ProductCard product={product} priority={index === 0} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
