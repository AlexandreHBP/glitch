/**
 * Formato de paginação usado pelos endpoints de listagem admin
 * (produtos e pedidos). Espelha PaginatedResponseDto do backend.
 */

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}
