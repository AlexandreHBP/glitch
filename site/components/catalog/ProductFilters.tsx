"use client";

/**
 * Busca (com debounce) do catálogo (RF01). Client leaf: lê/escreve os
 * query params da URL, então o Server Component da página refaz o fetch
 * com os novos filtros — sem duplicar estado de dados aqui.
 *
 * Sem filtro de categoria de propósito: a loja vende só camisetas, então
 * uma única categoria não justifica esse controle na experiência pública
 * (pedido do Alexandre). A entidade Category e a filtragem por categoria
 * continuam existindo no backend/admin, só não aparecem aqui.
 */
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("busca") ?? "");
  const debouncedSearch = useDebounce(search, 400);
  const isFirstRender = useRef(true);

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
    </div>
  );
}
