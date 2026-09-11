/**
 * Paginação do catálogo. Server component — só gera links `?pagina=N`
 * preservando os demais query params, sem JS extra.
 */
import Link from "next/link";
import { cn } from "@/lib/cn";

type PaginationProps = {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
  basePath: string;
};

export function Pagination({ page, totalPages, searchParams, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "pagina") params.set(key, value);
    }
    params.set("pagina", String(targetPage));
    return `${basePath}?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Paginação do catálogo" className="mt-10 flex items-center justify-center gap-2">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={cn(
          "rounded-md px-3 py-2 text-sm",
          page <= 1 ? "pointer-events-none text-slate-600" : "text-slate-300 hover:bg-white/5",
        )}
      >
        Anterior
      </Link>
      <ul className="flex items-center gap-1">
        {pages.map((p) => (
          <li key={p}>
            <Link
              href={hrefFor(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md text-sm",
                p === page ? "bg-wine text-bone" : "text-slate-300 hover:bg-white/5",
              )}
            >
              {p}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={cn(
          "rounded-md px-3 py-2 text-sm",
          page >= totalPages ? "pointer-events-none text-slate-600" : "text-slate-300 hover:bg-white/5",
        )}
      >
        Próxima
      </Link>
    </nav>
  );
}
