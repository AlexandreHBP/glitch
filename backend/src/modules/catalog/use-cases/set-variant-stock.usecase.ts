/**
 * Ajusta o estoque de uma variação pelo admin, delegando ao InventoryService
 * para manter a auditoria de stock_movements.
 */
import { Injectable } from '@nestjs/common';
import { InventoryService } from '../../inventory/inventory.service';
import { ProductVariant } from '../entities/product-variant.entity';
import { SetVariantStock } from './interfaces';

@Injectable()
export class SetVariantStockUseCase implements SetVariantStock {
  constructor(private readonly inventoryService: InventoryService) {}

  async setVariantStock(
    variantId: string,
    quantity: number,
    reason: string,
  ): Promise<ProductVariant> {
    return this.inventoryService.adjustStock(variantId, quantity, reason);
  }
}
