/**
 * Indica a disponibilidade em estoque de uma variação (RF01/RF04). Sempre
 * texto simples ("Esgotado" em vez de "stock: 0") — sem glitch, é
 * informação funcional.
 */
import { cn } from "@/lib/cn";

export function StockBadge({ stockQuantity }: { stockQuantity: number | null }) {
  if (stockQuantity === null) {
    return <p className="text-sm text-slate-400">Selecione tamanho e cor para ver o estoque.</p>;
  }

  if (stockQuantity <= 0) {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-medium text-red-400">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-red-500" />
        Esgotado nesta variação
      </p>
    );
  }

  const isLow = stockQuantity <= 3;

  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium",
        isLow ? "text-amber-400" : "text-emerald-400",
      )}
    >
      <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", isLow ? "bg-amber-400" : "bg-emerald-400")} />
      {isLow ? `Últimas ${stockQuantity} unidades` : "Em estoque"}
    </p>
  );
}
