/**
 * Serviço de categorias públicas — GET /categories.
 */
import { apiFetch } from "./client";
import type { Category } from "@/types/product";

export const categoriesApi = {
  list(revalidate = 300) {
    return apiFetch<Category[]>("/categories", { next: { revalidate } });
  },
};
