/**
 * Diálogo de confirmação genérico, usado antes de qualquer exclusão
 * (produto, faixa da playlist) — regra de ouro do painel admin.
 */
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} className="max-w-md m-4">
      <div className="p-6">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="!bg-error-500 hover:!bg-error-600"
          >
            {isLoading ? "Aguarde..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
