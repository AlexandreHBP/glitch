/**
 * Debita o estoque de uma variação e grava o movimento de saída (OUT).
 * Chamado dentro da transação do CreateOrderUseCase, com a variação já
 * travada por lock pessimista — nunca chamado fora de uma transação.
 */
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ProductVariant } from '../../catalog/entities/product-variant.entity';
import { StockMovement } from '../entities/stock-movement.entity';
import { StockMovementType } from '../enums/stock-movement-type.enum';
import { DebitStock } from './interfaces';

@Injectable()
export class DebitStockUseCase implements DebitStock {
  async debitStock(
    manager: EntityManager,
    variant: ProductVariant,
    quantity: number,
    orderId: string,
  ): Promise<void> {
    variant.stockQuantity -= quantity;
    await manager.save(ProductVariant, variant);

    const movement = manager.create(StockMovement, {
      productVariantId: variant.id,
      orderId,
      type: StockMovementType.OUT,
      quantity,
      reason: 'Débito por criação de pedido',
    });
    await manager.save(StockMovement, movement);
  }
}
