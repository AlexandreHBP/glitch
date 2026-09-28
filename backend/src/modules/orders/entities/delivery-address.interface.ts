/**
 * Formato do snapshot de endereço de entrega gravado em orders.delivery_address
 * (jsonb). Não existe tabela de endereços editável: a entrega é combinada
 * fora do site e o endereço precisa ser o daquele pedido específico.
 */
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
