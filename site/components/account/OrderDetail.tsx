"use client";

/**
 * Detalhe de um pedido (RF06) — GET /orders/:id, que já inclui o histórico
 * de status. Usado tanto em /minha-conta/pedidos/[id] quanto na tela de
 * confirmação logo após o checkout.
 */
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { ordersApi } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { OrderStatusTimeline } from "@/components/account/OrderStatusTimeline";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/types/order";

const DELIVERY_METHOD_LABEL: Record<string, string> = {
  PICKUP: "Retirar pessoalmente",
  SHIPPING: "Envio pelo correio",
};

export function OrderDetail({ orderId, showSuccessBanner = false }: { orderId: string; showSuccessBanner?: boolean }) {
  const { ready } = useRequireAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    ordersApi
      .getById(orderId)
      .then(setOrder)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar o pedido."));
  }, [ready, orderId]);

  if (!ready) return null;

  if (error) {
    return <p role="alert" className="text-sm text-red-400">{error}</p>;
  }

  if (!order) {
    return <p className="text-sm text-slate-400">Carregando pedido...</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {showSuccessBanner && (
        <div role="status" className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <p className="font-semibold text-emerald-300">Pedido registrado com sucesso!</p>
          <p className="mt-1 text-sm text-emerald-200/80">
            Seu pedido {order.orderNumber} foi recebido. A gente vai combinar com você a forma de
            pagamento e a entrega — nada foi cobrado no site.
          </p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">Pedido {order.orderNumber}</h1>
              <span className="font-semibold text-bone">{formatPrice(order.total)}</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Entrega: {DELIVERY_METHOD_LABEL[order.deliveryMethod] ?? order.deliveryMethod}
            </p>

            <ul className="mt-5 divide-y divide-white/5" role="list">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium text-white">
                      {item.quantity}x {item.productName}
                    </p>
                    <p className="text-xs text-slate-400">{item.variantLabel}</p>
                  </div>
                  <span className="text-slate-300">{formatPrice(item.subtotal)}</span>
                </li>
              ))}
            </ul>

            {order.deliveryAddress && (
              <div className="mt-5 border-t border-white/5 pt-4 text-sm text-slate-400">
                <p className="font-medium text-slate-300">Endereço de entrega</p>
                <p className="mt-1">
                  {order.deliveryAddress.street}, {order.deliveryAddress.number}
                  {order.deliveryAddress.complement ? ` — ${order.deliveryAddress.complement}` : ""}
                </p>
                <p>
                  {order.deliveryAddress.neighborhood}, {order.deliveryAddress.city}/{order.deliveryAddress.state} —{" "}
                  {order.deliveryAddress.zipCode}
                </p>
              </div>
            )}

            {order.customerNotes && (
              <div className="mt-4 border-t border-white/5 pt-4 text-sm text-slate-400">
                <p className="font-medium text-slate-300">Observações</p>
                <p className="mt-1">{order.customerNotes}</p>
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <OrderStatusTimeline order={order} />
        </aside>
      </div>
    </div>
  );
}
