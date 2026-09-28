/**
 * CRUD de produtos e ajuste de estoque de variação, consumindo as rotas
 * /admin/products e /admin/variants/:id/stock (ver
 * backend/src/modules/catalog/catalog-admin.controller.ts).
 */
import { api } from "./api";
import type { PaginatedResponse } from "../types/pagination.types";
import type {
  CreateProductPayload,
  DeleteProductResult,
  Product,
  ProductListQuery,
  ProductVariant,
  SetVariantStockPayload,
  UpdateProductPayload,
} from "../types/product.types";

export const productService = {
  list: async (query: ProductListQuery): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<PaginatedResponse<Product>>("/admin/products", {
      params: query,
    });
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/admin/products/${id}`);
    return response.data;
  },

  create: async (payload: CreateProductPayload): Promise<Product> => {
    const response = await api.post<Product>("/admin/products", payload);
    return response.data;
  },

  update: async (id: string, payload: UpdateProductPayload): Promise<Product> => {
    const response = await api.put<Product>(`/admin/products/${id}`, payload);
    return response.data;
  },

  remove: async (id: string): Promise<DeleteProductResult> => {
    const response = await api.delete<DeleteProductResult>(`/admin/products/${id}`);
    return response.data;
  },

  setVariantStock: async (
    variantId: string,
    payload: SetVariantStockPayload
  ): Promise<ProductVariant> => {
    const response = await api.put<ProductVariant>(
      `/admin/variants/${variantId}/stock`,
      payload
    );
    return response.data;
  },
};
