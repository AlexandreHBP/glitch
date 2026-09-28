/**
 * Tipos de pedido — espelham as entidades e enums do backend
 * (src/modules/orders/*). O DTO de criação nunca carrega preço: o
 * servidor recalcula tudo a partir do banco (ver create-order-item.dto.ts).
 */
export enum DeliveryMethod {
  PICKUP = "PICKUP",
  SHIPPING = "SHIPPING",
}

export enum OrderStatus {
  AGUARDANDO_CONTATO = "AGUARDANDO_CONTATO",
  EM_PREPARO = "EM_PREPARO",
  ENVIADO = "ENVIADO",
  ENTREGUE = "ENTREGUE",
  CANCELADO = "CANCELADO",
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.AGUARDANDO_CONTATO]: "Aguardando contato",
  [OrderStatus.EM_PREPARO]: "Em preparo",
  [OrderStatus.ENVIADO]: "Enviado",
  [OrderStatus.ENTREGUE]: "Entregue",
  [OrderStatus.CANCELADO]: "Cancelado",
};

export const ORDER_STATUS_SEQUENCE = [
  OrderStatus.AGUARDANDO_CONTATO,
  OrderStatus.EM_PREPARO,
  OrderStatus.ENVIADO,
  OrderStatus.ENTREGUE,
];

export type DeliveryAddress = {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  referencePoint?: string;
};

export type CreateOrderItemInput = {
  productVariantId: string;
  quantity: number;
};

export type CreateOrderInput = {
  items: CreateOrderItemInput[];
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: DeliveryAddress;
  customerNotes?: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productVariantId: string;
  productName: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: string;
};

export type OrderStatusHistoryEntry = {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
};

export type Order = {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: DeliveryAddress | null;
  customerNotes: string | null;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
};

/** Formato do corpo de erro 409 devolvido pelo CreateOrderUseCase. */
export type UnavailableOrderItem = {
  productVariantId: string;
  reason: string;
};

export type OrderConflictBody = {
  message: string;
  items: UnavailableOrderItem[];
};
