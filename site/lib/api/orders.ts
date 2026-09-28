/**
 * Serviço de pedidos do cliente autenticado — POST /orders, GET /orders,
 * GET /orders/:id. Nunca envie preço: o DTO só aceita productVariantId e
 * quantity por item (ver create-order-item.dto.ts no backend).
 */
import { apiFetch } from "./client";
import type { Paginated } from "@/types/pagination";
import type { CreateOrderInput, Order, OrderStatus } from "@/types/order";

export type ListMyOrdersParams = {
  page?: number;
  limit?: number;
  status?: OrderStatus;
};

function buildQuery(params: ListMyOrdersParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export const ordersApi = {
  create(input: CreateOrderInput) {
    return apiFetch<Order>("/orders", { method: "POST", body: input });
  },
  listMine(params: ListMyOrdersParams = {}) {
    return apiFetch<Paginated<Order>>(`/orders${buildQuery(params)}`, { cache: "no-store" });
  },
  getById(id: string) {
    return apiFetch<Order>(`/orders/${id}`, { cache: "no-store" });
  },
};
