import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovement } from './entities/stock-movement.entity';
import { ProductVariant } from '../catalog/entities/product-variant.entity';
import { InventoryService } from './inventory.service';
import {
  DebitStockUseCase,
  RestoreStockUseCase,
  AdjustStockUseCase,
} from './use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([StockMovement, ProductVariant])],
  providers: [
    InventoryService,
    DebitStockUseCase,
    RestoreStockUseCase,
    AdjustStockUseCase,
  ],
  exports: [InventoryService],
})
export class InventoryModule {}
