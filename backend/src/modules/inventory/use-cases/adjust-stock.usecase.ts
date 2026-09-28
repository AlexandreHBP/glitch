/**
 * Ajuste manual de estoque pelo admin (PUT /admin/variants/:id/stock).
 * Define a quantidade absoluta e grava o delta como movimento ADJUSTMENT.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductVariant } from '../../catalog/entities/product-variant.entity';
import { StockMovement } from '../entities/stock-movement.entity';
import { StockMovementType } from '../enums/stock-movement-type.enum';
import { AdjustStock } from './interfaces';

@Injectable()
export class AdjustStockUseCase implements AdjustStock {
  constructor(private readonly dataSource: DataSource) {}

  async adjustStock(
    variantId: string,
    newQuantity: number,
    reason: string,
  ): Promise<ProductVariant> {
    return this.dataSource.transaction(async (manager) => {
      const variant = await manager.findOne(ProductVariant, {
        where: { id: variantId },
      });
      if (!variant) {
        throw new NotFoundException('Variação não encontrada');
      }

      const delta = newQuantity - variant.stockQuantity;
      variant.stockQuantity = newQuantity;
      await manager.save(ProductVariant, variant);

      if (delta !== 0) {
        const movement = manager.create(StockMovement, {
          productVariantId: variant.id,
          orderId: null,
          type: StockMovementType.ADJUSTMENT,
          quantity: delta,
          reason,
        });
        await manager.save(StockMovement, movement);
      }

      return variant;
    });
  }
}
