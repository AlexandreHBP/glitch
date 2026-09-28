/**
 * Lista de pedidos recebidos (RF08): filtro por status e paginação.
 */
import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Spinner } from "../../components/common/Spinner";
import { Pagination } from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";
import Badge from "../../components/ui/badge/Badge";
import Select from "../../components/form/Select";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { orderService } from "../../services/orderService";
import { getErrorMessage } from "../../services/api";
import { formatCurrency, formatDate } from "../../utils/format";
import { ORDER_STATUSES } from "../../types/order.types";
import type { OrderStatus } from "../../types/order.types";
import { ORDER_STATUS_BADGE_COLOR, ORDER_STATUS_LABELS } from "../../utils/orderStatus";

const PAGE_SIZE = 20;

const statusOptions = [
  { value: "TODOS", label: "Todos os status" },
  ...ORDER_STATUSES.map((status) => ({ value: status, label: ORDER_STATUS_LABELS[status] })),
];

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "TODOS">("TODOS");
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-orders", page, statusFilter],
    queryFn: () =>
      orderService.list({
        page,
        limit: PAGE_SIZE,
        status: statusFilter === "TODOS" ? undefined : statusFilter,
      }),
  });

  return (
    <>
      <PageMeta title="Pedidos | Glitch Admin" description="Pedidos recebidos pela loja Glitch" />
      <PageBreadcrumb pageTitle="Pedidos" />

      <div className="mb-4 max-w-xs">
        <Select
          options={statusOptions}
          defaultValue="TODOS"
          onChange={(value) => {
            setStatusFilter(value as OrderStatus | "TODOS");
            setPage(1);
          }}
        />
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
            title="Nenhum pedido por aqui ainda"
            description="Assim que um cliente finalizar uma compra no site, o pedido aparece automaticamente nesta lista."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Pedido
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Cliente
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Total
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Recebido em
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.data.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    onClick={() => navigate(`/pedidos/${order.id}`)}
                  >
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {order.user?.name ?? "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge color={ORDER_STATUS_BADGE_COLOR[order.status]} size="sm">
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
      )}
    </>
  );
}
