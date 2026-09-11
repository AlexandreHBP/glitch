/**
 * Interfaces segregadas do módulo de catálogo.
 */
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

export interface ListPublicProducts {
  listPublicProducts(
    query: ProductQueryDto,
  ): Promise<PaginatedResponseDto<Product>>;
}

export interface GetProductBySlug {
  getProductBySlug(slug: string): Promise<Product>;
}

export interface ListCategories {
  listCategories(): Promise<Category[]>;
}

export interface ListAdminProducts {
  listAdminProducts(
    query: ProductQueryDto,
  ): Promise<PaginatedResponseDto<Product>>;
}

export interface GetAdminProductById {
  getAdminProductById(id: string): Promise<Product>;
}

export interface CreateProduct {
  createProduct(dto: CreateProductDto): Promise<Product>;
}

export interface UpdateProduct {
  updateProduct(id: string, dto: UpdateProductDto): Promise<Product>;
}

export interface DeleteProduct {
  deleteProduct(id: string): Promise<{ hardDeleted: boolean }>;
}

export interface SetVariantStock {
  setVariantStock(
    variantId: string,
    quantity: number,
    reason: string,
  ): Promise<ProductVariant>;
}
