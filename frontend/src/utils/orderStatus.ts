/**
 * Tradução dos status de pedido para linguagem simples (o admin é leigo
 * em tecnologia) e mapa de transições válidas, espelhando
 * backend/src/modules/orders/order-status-transitions.ts — mantido aqui
 * só para desenhar a UI; o backend continua sendo a autoridade e pode
 * recusar com 409 se algo estiver fora de sincronia.
 */
import type { OrderStatus } from "../types/order.types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  AGUARDANDO_CONTATO: "Aguardando contato",
  EM_PREPARO: "Em preparo",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export const ORDER_STATUS_BADGE_COLOR: Record<
  OrderStatus,
  "primary" | "success" | "error" | "warning" | "info" | "light" | "dark"
> = {
  AGUARDANDO_CONTATO: "warning",
  EM_PREPARO: "info",
  ENVIADO: "primary",
  ENTREGUE: "success",
  CANCELADO: "error",
};

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  AGUARDANDO_CONTATO: ["EM_PREPARO", "CANCELADO"],
  EM_PREPARO: ["ENVIADO", "CANCELADO"],
  ENVIADO: ["ENTREGUE", "CANCELADO"],
  ENTREGUE: [],
  CANCELADO: [],
};

export const DELIVERY_METHOD_LABELS: Record<string, string> = {
  PICKUP: "Retirada na loja",
  SHIPPING: "Entrega",
};
