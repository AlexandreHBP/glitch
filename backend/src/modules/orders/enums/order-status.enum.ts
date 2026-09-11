/**
 * Máquina de estados do pedido. Guardado como varchar (não enum nativo do
 * Postgres): alterar enum nativo exige migration chata a cada novo status.
 *
 *   AGUARDANDO_CONTATO -> EM_PREPARO -> ENVIADO -> ENTREGUE
 *           |                |            |
 *                    CANCELADO (devolve estoque)
 */
export enum OrderStatus {
  AGUARDANDO_CONTATO = 'AGUARDANDO_CONTATO',
  EM_PREPARO = 'EM_PREPARO',
  ENVIADO = 'ENVIADO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO',
}
