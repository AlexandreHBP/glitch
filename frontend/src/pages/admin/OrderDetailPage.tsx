/**
 * Detalhe de um pedido (RF08): itens, cliente, entrega, total e ação de
 * mudar o status — respeitando as transições que o backend aceita
 * (AGUARDANDO_CONTATO -> EM_PREPARO -> ENVIADO -> ENTREGUE, ou CANCELADO
 * a qualquer momento antes de ENTREGUE). Erros de transição inválida
 * (409 do backend) são mostrados com a mensagem já pronta em português.
 */
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Spinner } from "../../components/common/Spinner";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import Alert from "../../components/ui/alert/Alert";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import TextArea from "../../components/form/input/TextArea";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { orderService } from "../../services/orderService";
import { getErrorMessage } from "../../services/api";
import { formatCurrency, formatDate } from "../../utils/format";
import {
  DELIVERY_METHOD_LABELS,
  ORDER_STATUS_BADGE_COLOR,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TRANSITIONS,
} from "../../utils/orderStatus";
import type { OrderStatus } from "../../types/order.types";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");
  const [note, setNote] = useState("");
  const [statusError, setStatusError] = useState("");

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => orderService.getById(id as string),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: () =>
      orderService.updateStatus(id as string, {
        status: nextStatus as OrderStatus,
        note: note || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setNextStatus("");
      setNote("");
      setStatusError("");
    },
    onError: (err) => setStatusError(getErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !order) {
    return <Alert variant="error" title="Pedido não encontrado" message={getErrorMessage(error)} />;
  }

  const availableTransitions = ORDER_STATUS_TRANSITIONS[order.status];

  const handleStatusSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!nextStatus) return;
    mutation.mutate();
  };

  return (
    <>
      <PageMeta title={`Pedido ${order.orderNumber} | Glitch Admin`} description="Detalhe do pedido" />
      <PageBreadcrumb pageTitle={`Pedido ${order.orderNumber}`} />

      <div className="mb-4">
        <Button type="button" variant="outline" size="sm" onClick={() => navigate("/pedidos")}>
          ← Voltar para pedidos
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Itens</h3>
              <Badge color={ORDER_STATUS_BADGE_COLOR[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell isHeader className="px-3 py-2 text-left text-theme-xs font-medium text-gray-500">
                      Produto
                    </TableCell>
                    <TableCell isHeader className="px-3 py-2 text-left text-theme-xs font-medium text-gray-500">
                      Qtd.
                    </TableCell>
                    <TableCell isHeader className="px-3 py-2 text-left text-theme-xs font-medium text-gray-500">
                      Preço un.
                    </TableCell>
                    <TableCell isHeader className="px-3 py-2 text-left text-theme-xs font-medium text-gray-500">
                      Subtotal
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-3 py-3 text-gray-800 dark:text-white/90">
                        {item.productName}
                        <span className="block text-theme-xs text-gray-400">{item.variantLabel}</span>
                      </TableCell>
                      <TableCell className="px-3 py-3 text-gray-500 dark:text-gray-400">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-end text-base font-semibold text-gray-800 dark:text-white/90">
              Total: {formatCurrency(order.total)}
            </div>
          </div>

          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                Histórico
              </h3>
              <ul className="space-y-3">
                {order.statusHistory.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-3 text-sm">
                    <Badge size="sm" color={ORDER_STATUS_BADGE_COLOR[entry.status]}>
                      {ORDER_STATUS_LABELS[entry.status]}
                    </Badge>
                    <div>
                      <p className="text-gray-600 dark:text-gray-300">{entry.note ?? "-"}</p>
                      <p className="text-theme-xs text-gray-400">{formatDate(entry.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">Cliente</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{order.user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{order.user?.email}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">Entrega</h3>
            <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              {DELIVERY_METHOD_LABELS[order.deliveryMethod] ?? order.deliveryMethod}
            </p>
            {order.deliveryAddress && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {order.deliveryAddress.street}, {order.deliveryAddress.number}
                {order.deliveryAddress.complement ? ` - ${order.deliveryAddress.complement}` : ""}
                <br />
                {order.deliveryAddress.neighborhood} - {order.deliveryAddress.city}/
                {order.deliveryAddress.state}
                <br />
                CEP {order.deliveryAddress.zipCode}
              </p>
            )}
            {order.customerNotes && (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                <strong className="text-gray-700 dark:text-gray-300">Observações: </strong>
                {order.customerNotes}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
              Mudar status
            </h3>

            {statusError && (
              <div className="mb-4">
                <Alert variant="error" title="Não foi possível mudar o status" message={statusError} />
              </div>
            )}

            {availableTransitions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Este pedido já está em um status final e não pode mais ser alterado.
              </p>
            ) : (
              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nextStatus">Novo status</Label>
                  <Select
                    placeholder="Selecione o novo status"
                    options={availableTransitions.map((status) => ({
                      value: status,
                      label: ORDER_STATUS_LABELS[status],
                    }))}
                    onChange={(value) => setNextStatus(value as OrderStatus)}
                  />
                </div>
                <div>
                  <Label htmlFor="note">Nota (opcional)</Label>
                  <TextArea
                    placeholder="Ex.: separando os itens para envio"
                    value={note}
                    onChange={setNote}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full justify-center" disabled={!nextStatus || mutation.isPending}>
                  {mutation.isPending ? "Salvando..." : "Confirmar mudança"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
