/**
 * Tipos do catálogo (produtos, variações, categorias), espelhando as
 * entidades e DTOs de backend/src/modules/catalog/.
 */
import type { PaginationQuery } from "./pagination.types";

/**
 * Atributos de estilo do mockup de referência (filtros da home do site).
 * Espelha backend/src/modules/catalog/enums/product-style-tag.enum.ts.
 */
export enum ProductStyleTag {
  GENDER_FLUID = "fluido_genero",
  UNISEX = "unissex",
  ADAPTIVE_FIT = "corte_adaptavel",
  ALL_BODIES = "todos_os_corpos",
  NEW_RELEASE = "lancamento",
}

export const PRODUCT_STYLE_TAG_LABELS: Record<ProductStyleTag, string> = {
  [ProductStyleTag.GENDER_FLUID]: "Fluido de Gênero",
  [ProductStyleTag.UNISEX]: "Unissex",
  [ProductStyleTag.ADAPTIVE_FIT]: "Corte Adaptável",
  [ProductStyleTag.ALL_BODIES]: "Todos os Corpos",
  [ProductStyleTag.NEW_RELEASE]: "Lançamento",
};

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
  styleTags: ProductStyleTag[];
  model3dUrl: string | null;
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
  styleTags?: ProductStyleTag[];
  variants: CreateVariantPayload[];
  images?: ProductImagePayload[];
  model3dUrl?: string;
}

export type UpdateProductPayload = Partial<Omit<CreateProductPayload, "variants" | "model3dUrl">> & {
  variants?: CreateVariantPayload[];
  // Null explícito remove o modelo 3D já vinculado ao produto (ver
  // UpdateProductDto no backend, que redeclara o campo para aceitar null).
  model3dUrl?: string | null;
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
