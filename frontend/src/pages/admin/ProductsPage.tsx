/**
 * Lista de produtos do painel admin (RF07): busca, paginação, e ações de
 * editar/excluir. Linguagem simples para um usuário leigo: "Publicado"
 * em vez de active=true, "Esgotado" quando o estoque somado é zero.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Spinner } from "../../components/common/Spinner";
import { Pagination } from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { productService } from "../../services/productService";
import { getErrorMessage } from "../../services/api";
import { useDebounce } from "../../hooks/useDebounce";
import { formatCurrency } from "../../utils/format";
import type { Product } from "../../types/product.types";

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const debouncedSearch = useDebounce(search);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-products", page, debouncedSearch],
    queryFn: () => productService.list({ page, limit: PAGE_SIZE, search: debouncedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setProductToDelete(null);
    },
    onError: (err) => setDeleteError(getErrorMessage(err)),
  });

  const totalStock = (product: Product) =>
    product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);

  return (
    <>
      <PageMeta title="Produtos | Glitch Admin" description="Gerencie os produtos da loja Glitch" />
      <PageBreadcrumb pageTitle="Produtos" />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Buscar por nome do produto..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Button onClick={() => navigate("/produtos/novo")} className="whitespace-nowrap">
          + Novo produto
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-error-500">{getErrorMessage(error)}</div>
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            title="Nenhum produto cadastrado ainda"
            description="Clique em 'Novo produto' para cadastrar o primeiro item do catálogo."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Produto
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Categoria
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Preço
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Estoque
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Situação
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-right text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Ações
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.data.map((product) => {
                  const stock = totalStock(product);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                        <span className="font-medium">{product.name}</span>
                        <span className="block text-theme-xs text-gray-400">
                          {product.variants.length} variação(ões)
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {product.category?.name ?? "Sem categoria"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {formatCurrency(product.basePrice)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {stock === 0 ? (
                          <Badge color="error" size="sm">
                            Esgotado
                          </Badge>
                        ) : (
                          `${stock} un.`
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge color={product.active ? "success" : "light"} size="sm">
                          {product.active ? "Publicado" : "Não publicado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/produtos/${product.id}/editar`}
                            state={{ product }}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError("");
                              setProductToDelete(product);
                            }}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-error-500 hover:bg-error-50 dark:border-gray-700 dark:hover:bg-error-500/10"
                          >
                            Excluir
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
      )}

      <ConfirmDialog
        isOpen={!!productToDelete}
        title="Excluir produto"
        message={
          deleteError
            ? deleteError
            : `Tem certeza que deseja excluir "${productToDelete?.name}"? Se este produto já tiver pedidos registrados, ele será apenas ocultado do site em vez de apagado.`
        }
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={() => productToDelete && deleteMutation.mutate(productToDelete.id)}
        onCancel={() => {
          setProductToDelete(null);
          setDeleteError("");
        }}
      />
    </>
  );
}
