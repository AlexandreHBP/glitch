/**
 * Paginação simples (anterior/próxima + números) para listas server-side.
 */
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (candidate) => candidate === 1 || candidate === totalPages || Math.abs(candidate - page) <= 1
  );

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-4" aria-label="Paginação">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-gray-300 px-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
      >
        Anterior
      </button>

      {pages.map((candidate, index) => (
        <span key={candidate} className="flex items-center gap-1.5">
          {index > 0 && pages[index - 1] !== candidate - 1 && (
            <span className="px-1 text-gray-400">...</span>
          )}
          <button
            type="button"
            onClick={() => onPageChange(candidate)}
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm ${
              candidate === page
                ? "bg-brand-500 text-white"
                : "border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
            }`}
          >
            {candidate}
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-gray-300 px-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
      >
        Próxima
      </button>
    </nav>
  );
}
