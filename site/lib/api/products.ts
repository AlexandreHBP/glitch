/**
 * Serviço de catálogo público — GET /products, GET /products/:slug.
 */
import { apiFetch } from "./client";
import type { Paginated } from "@/types/pagination";
import type { Product } from "@/types/product";

export type ListProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
};

function buildQuery(params: ListProductsParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.categoryId) query.set("categoryId", params.categoryId);
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export const productsApi = {
  list(params: ListProductsParams = {}, revalidate = 60) {
    return apiFetch<Paginated<Product>>(`/products${buildQuery(params)}`, {
      next: { revalidate },
    });
  },
  getBySlug(slug: string, revalidate = 60) {
    return apiFetch<Product>(`/products/${encodeURIComponent(slug)}`, {
      next: { revalidate },
    });
  },
};
