/**
 * Interfaces segregadas do módulo de estoque. Todos os métodos recebem o
 * `EntityManager` da transação em curso — o estoque é sempre movimentado
 * dentro da MESMA transação do pedido (nunca em uma transação separada),
 * para nascer/morrer junto com o pedido.
 */
import { EntityManager } from 'typeorm';
import { ProductVariant } from '../../catalog/entities/product-variant.entity';

export interface DebitStock {
  debitStock(
    manager: EntityManager,
    variant: ProductVariant,
    quantity: number,
    orderId: string,
  ): Promise<void>;
}

export interface RestoreStock {
  restoreStock(
    manager: EntityManager,
    variantId: string,
    quantity: number,
    orderId: string,
    reason: string,
  ): Promise<void>;
}

export interface AdjustStock {
  adjustStock(
    variantId: string,
    newQuantity: number,
    reason: string,
  ): Promise<ProductVariant>;
}
