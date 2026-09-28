"use client";

/**
 * Histórico de pedidos do cliente logado (RF02/RF06) — GET /orders.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { ordersApi } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { ORDER_STATUS_LABEL, type Order } from "@/types/order";
import { formatDateTime, formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/Button";

export function OrderList() {
  const { ready } = useRequireAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    ordersApi
      .listMine({ limit: 50 })
      .then((result) => setOrders(result.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar seus pedidos."));
  }, [ready]);

  if (!ready) return null;

  if (error) {
    return <p role="alert" className="text-sm text-red-400">{error}</p>;
  }

  if (orders === null) {
    return <p className="text-sm text-slate-400">Carregando pedidos...</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
        <p className="text-lg font-semibold text-white">Você ainda não fez nenhum pedido</p>
        <Button href="/produtos" className="mt-6" size="lg">
          Ver catálogo
        </Button>
      </div>
    );
  }

  return (
    <ul role="list" className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.02]">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/minha-conta/pedidos/${order.id}`}
            className="flex flex-col gap-1 p-5 transition hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-white">{order.orderNumber}</p>
              <p className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                {ORDER_STATUS_LABEL[order.status]}
              </span>
              <span className="font-semibold text-bone">{formatPrice(order.total)}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
