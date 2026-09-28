/**
 * Linha do tempo de status do pedido (RF06). Server-safe presentational:
 * recebe o pedido já carregado e desenha os passos concluídos vs.
 * pendentes. Pedido cancelado ganha um estado visual próprio, fora da
 * sequência linear.
 */
import { ORDER_STATUS_LABEL, ORDER_STATUS_SEQUENCE, OrderStatus, type Order } from "@/types/order";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

export function OrderStatusTimeline({ order }: { order: Order }) {
  const isCancelled = order.status === OrderStatus.CANCELADO;
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(order.status);

  const historyByStatus = new Map(order.statusHistory.map((entry) => [entry.status, entry]));

  return (
    <div>
      <h2 className="text-lg font-semibold text-white">Status do pedido</h2>

      {isCancelled ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-md bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-red-500" />
          Pedido cancelado
        </p>
      ) : (
        <ol className="mt-5 space-y-0" role="list">
          {ORDER_STATUS_SEQUENCE.map((status, index) => {
            const isDone = currentIndex >= 0 && index <= currentIndex;
            const historyEntry = historyByStatus.get(status);
            return (
              <li key={status} className="relative flex gap-4 pb-8 last:pb-0">
                {index < ORDER_STATUS_SEQUENCE.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-[11px] top-6 h-full w-0.5",
                      isDone ? "bg-wine-bright" : "bg-white/10",
                    )}
                  />
                )}
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                    isDone ? "border-wine-bright bg-wine-bright" : "border-white/20 bg-slate-950",
                  )}
                >
                  {isDone && (
                    <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="white" strokeWidth="2">
                      <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <div>
                  <p className={cn("text-sm font-medium", isDone ? "text-white" : "text-slate-500")}>
                    {ORDER_STATUS_LABEL[status]}
                  </p>
                  {historyEntry && (
                    <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(historyEntry.createdAt)}</p>
                  )}
                  {historyEntry?.note && <p className="mt-0.5 text-xs text-slate-400">{historyEntry.note}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
