/**
 * Envelope padrão de resposta paginada devolvido por toda listagem da API
 * (espelha PaginatedResponseDto do backend).
 */
export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  search?: string;
};
