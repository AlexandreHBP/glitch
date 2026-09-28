/**
 * Tipos do domínio de pedidos (admin), espelhando
 * backend/src/modules/orders/.
 */
import type { AuthUser } from "./auth.types";
import type { PaginationQuery } from "./pagination.types";

export const ORDER_STATUSES = [
  "AGUARDANDO_CONTATO",
  "EM_PREPARO",
  "ENVIADO",
  "ENTREGUE",
  "CANCELADO",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type DeliveryMethod = "PICKUP" | "SHIPPING";

export interface DeliveryAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  referencePoint?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  productName: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  user: AuthUser & { active: boolean; createdAt: string; updatedAt: string };
  orderNumber: string;
  status: OrderStatus;
  total: number;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: DeliveryAddress | null;
  customerNotes: string | null;
  items: OrderItem[];
  statusHistory?: OrderStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderListQuery extends PaginationQuery {
  status?: OrderStatus;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  note?: string;
}
