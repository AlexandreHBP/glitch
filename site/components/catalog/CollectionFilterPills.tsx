"use client";

/**
 * Filtros em "pílula" da seção "A Coleção" da home (mockup de referência).
 * Filtra de verdade pelo campo `styleTags` do produto (marcado pelo admin
 * no cadastro/edição — ver ProductFormPage no painel), em vez de aproximar
 * por texto do nome/descrição. Como ainda não existem produtos reais
 * cadastrados com essas tags, é esperado que os filtros fiquem vazios até
 * o Alexandre cadastrar peças com os atributos marcados — nesse caso
 * mostramos um aviso, em vez de uma grade vazia sem explicação.
 */
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { cn } from "@/lib/cn";
import { ProductStyleTag, type Product } from "@/types/product";

type FilterDef = {
  id: "todos" | ProductStyleTag;
  label: string;
};

const FILTERS: FilterDef[] = [
  { id: "todos", label: "Todos" },
  { id: ProductStyleTag.GENDER_FLUID, label: "Fluido de gênero" },
  { id: ProductStyleTag.UNISEX, label: "Unissex" },
  { id: ProductStyleTag.ADAPTIVE_FIT, label: "Corte adaptável" },
  { id: ProductStyleTag.ALL_BODIES, label: "Todos os corpos" },
  { id: ProductStyleTag.NEW_RELEASE, label: "Lançamento" },
];

export function CollectionFilterPills({ products }: { products: Product[] }) {
  const [activeId, setActiveId] = useState<FilterDef["id"]>("todos");

  const list = useMemo(() => {
    if (activeId === "todos") return products;
    return products.filter((product) => product.styleTags?.includes(activeId));
  }, [activeId, products]);

  const isEmptyFilter = activeId !== "todos" && list.length === 0;

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

      {isEmptyFilter ? (
        <p className="mt-10 text-sm text-slate-400">
          Nenhuma peça marcada com esse atributo de estilo ainda — volte em breve.
        </p>
      ) : list.length === 0 ? (
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
