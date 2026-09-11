"use client";

/**
 * Busca (com debounce) e filtro por categoria do catálogo (RF01). Client
 * leaf: lê/escreve os query params da URL, então o Server Component da
 * página refaz o fetch com os novos filtros — sem duplicar estado de
 * dados aqui.
 */
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/cn";
import type { Category } from "@/types/product";

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("busca") ?? "");
  const debouncedSearch = useDebounce(search, 400);
  const isFirstRender = useRef(true);

  const activeCategoryId = searchParams.get("categoria") ?? "";

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set("busca", debouncedSearch);
    else params.delete("busca");
    params.delete("pagina");
    router.push(`${pathname}?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reage à busca debounced
  }, [debouncedSearch]);

  function handleCategoryChange(categoryId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) params.set("categoria", categoryId);
    else params.delete("categoria");
    params.delete("pagina");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative w-full sm:max-w-xs">
        <span className="sr-only">Buscar produtos</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar na coleção..."
          autoComplete="off"
          className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:border-wine-bright focus:outline-none focus:ring-2 focus:ring-wine-bright/40"
        />
      </label>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
        <button
          type="button"
          onClick={() => handleCategoryChange("")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm transition",
            activeCategoryId === "" ? "bg-wine text-bone" : "bg-white/5 text-slate-300 hover:bg-white/10",
          )}
          aria-pressed={activeCategoryId === ""}
        >
          Todas
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleCategoryChange(category.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition",
              activeCategoryId === category.id
                ? "bg-wine text-bone"
                : "bg-white/5 text-slate-300 hover:bg-white/10",
            )}
            aria-pressed={activeCategoryId === category.id}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
