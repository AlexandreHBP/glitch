/**
 * Categorias do catálogo. A API atual só expõe leitura pública
 * (GET /categories) — não existe endpoint de CRUD de categorias no
 * backend hoje, então o formulário de produto apenas escolhe entre as
 * categorias já cadastradas.
 */
import { api } from "./api";
import type { Category } from "../types/product.types";

export const categoryService = {
  list: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>("/categories");
    return response.data;
  },
};
