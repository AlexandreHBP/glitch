/**
 * Devolve estoque a uma variação (cancelamento de pedido) e grava o
 * movimento de entrada (IN). Sempre chamado dentro da transação do
 * ChangeOrderStatusUseCase, protegido pelo status atual do pedido para
 * nunca devolver o mesmo estoque duas vezes.
 */
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ProductVariant } from '../../catalog/entities/product-variant.entity';
import { StockMovement } from '../entities/stock-movement.entity';
import { StockMovementType } from '../enums/stock-movement-type.enum';
import { RestoreStock } from './interfaces';

@Injectable()
export class RestoreStockUseCase implements RestoreStock {
  async restoreStock(
    manager: EntityManager,
    variantId: string,
    quantity: number,
    orderId: string,
    reason: string,
  ): Promise<void> {
    await manager.increment(
      ProductVariant,
      { id: variantId },
      'stockQuantity',
      quantity,
    );

    const movement = manager.create(StockMovement, {
      productVariantId: variantId,
      orderId,
      type: StockMovementType.IN,
      quantity,
      reason,
    });
    await manager.save(StockMovement, movement);
  }
}
