import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from './entities/category.entity';
import { CatalogController } from './catalog.controller';
import { CatalogAdminController } from './catalog-admin.controller';
import { InventoryModule } from '../inventory/inventory.module';
import {
  ListPublicProductsUseCase,
  GetProductBySlugUseCase,
  ListCategoriesUseCase,
  ListAdminProductsUseCase,
  GetAdminProductByIdUseCase,
  CreateProductUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase,
  SetVariantStockUseCase,
} from './use-cases';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariant, ProductImage, Category]),
    InventoryModule,
  ],
  controllers: [CatalogController, CatalogAdminController],
  providers: [
    ListPublicProductsUseCase,
    GetProductBySlugUseCase,
    ListCategoriesUseCase,
    ListAdminProductsUseCase,
    GetAdminProductByIdUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    SetVariantStockUseCase,
  ],
})
export class CatalogModule {}
