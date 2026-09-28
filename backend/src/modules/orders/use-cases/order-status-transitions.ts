/**
 * Máquina de estados do pedido:
 *
 *   AGUARDANDO_CONTATO -> EM_PREPARO -> ENVIADO -> ENTREGUE
 *           |                |            |
 *                    CANCELADO (devolve estoque, uma única vez)
 *
 * ENTREGUE e CANCELADO são estados terminais — nenhuma transição sai deles,
 * o que também garante que o estoque só é devolvido uma vez (uma vez
 * CANCELADO, o pedido nunca mais pode ser cancelado de novo).
 */
import { OrderStatus } from '../enums/order-status.enum';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.AGUARDANDO_CONTATO]: [
    OrderStatus.EM_PREPARO,
    OrderStatus.CANCELADO,
  ],
  [OrderStatus.EM_PREPARO]: [OrderStatus.ENVIADO, OrderStatus.CANCELADO],
  [OrderStatus.ENVIADO]: [OrderStatus.ENTREGUE, OrderStatus.CANCELADO],
  [OrderStatus.ENTREGUE]: [],
  [OrderStatus.CANCELADO]: [],
};

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
