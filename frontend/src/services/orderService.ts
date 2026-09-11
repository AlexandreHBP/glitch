/**
 * Listagem, detalhe e mudança de status de pedidos (admin), consumindo
 * /admin/orders (ver backend/src/modules/orders/orders-admin.controller.ts).
 */
import { api } from "./api";
import type { PaginatedResponse } from "../types/pagination.types";
import type {
  Order,
  OrderListQuery,
  UpdateOrderStatusPayload,
} from "../types/order.types";

export const orderService = {
  list: async (query: OrderListQuery): Promise<PaginatedResponse<Order>> => {
    const response = await api.get<PaginatedResponse<Order>>("/admin/orders", {
      params: query,
    });
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/admin/orders/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, payload: UpdateOrderStatusPayload): Promise<Order> => {
    const response = await api.patch<Order>(`/admin/orders/${id}/status`, payload);
    return response.data;
  },
};
