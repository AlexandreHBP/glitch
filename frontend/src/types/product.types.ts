/**
 * Tipos do catálogo (produtos, variações, categorias), espelhando as
 * entidades e DTOs de backend/src/modules/catalog/.
 */
import type { PaginationQuery } from "./pagination.types";

export interface Category {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  isCover: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: string;
  color: string;
  priceOverride: number | null;
  stockQuantity: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  categoryId: string | null;
  category: Category | null;
  active: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVariantPayload {
  sku?: string;
  size: string;
  color: string;
  priceOverride?: number | null;
  stockQuantity: number;
  active?: boolean;
}

export interface ProductImagePayload {
  url: string;
  isCover?: boolean;
  position?: number;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  basePrice: number;
  categoryId?: string;
  active?: boolean;
  variants: CreateVariantPayload[];
  images?: ProductImagePayload[];
}

export type UpdateProductPayload = Partial<Omit<CreateProductPayload, "variants">> & {
  variants?: CreateVariantPayload[];
};

export interface ProductListQuery extends PaginationQuery {
  categoryId?: string;
}

export interface SetVariantStockPayload {
  quantity: number;
  reason: string;
}

export interface DeleteProductResult {
  hardDeleted: boolean;
}
