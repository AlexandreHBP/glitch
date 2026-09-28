/**
 * Orquestra os use-cases de estoque para os módulos consumidores
 * (orders). Fina camada de composição — a regra de negócio fica nos
 * use-cases.
 */
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ProductVariant } from '../catalog/entities/product-variant.entity';
import { DebitStockUseCase } from './use-cases/debit-stock.usecase';
import { RestoreStockUseCase } from './use-cases/restore-stock.usecase';
import { AdjustStockUseCase } from './use-cases/adjust-stock.usecase';

@Injectable()
export class InventoryService {
  constructor(
    private readonly debitStockUseCase: DebitStockUseCase,
    private readonly restoreStockUseCase: RestoreStockUseCase,
    private readonly adjustStockUseCase: AdjustStockUseCase,
  ) {}

  debitStock(
    manager: EntityManager,
    variant: ProductVariant,
    quantity: number,
    orderId: string,
  ): Promise<void> {
    return this.debitStockUseCase.debitStock(
      manager,
      variant,
      quantity,
      orderId,
    );
  }

  restoreStock(
    manager: EntityManager,
    variantId: string,
    quantity: number,
    orderId: string,
    reason: string,
  ): Promise<void> {
    return this.restoreStockUseCase.restoreStock(
      manager,
      variantId,
      quantity,
      orderId,
      reason,
    );
  }

  adjustStock(
    variantId: string,
    newQuantity: number,
    reason: string,
  ): Promise<ProductVariant> {
    return this.adjustStockUseCase.adjustStock(variantId, newQuantity, reason);
  }
}
