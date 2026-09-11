/**
 * Placeholder exibido quando uma lista não tem itens, com mensagem clara
 * para um usuário leigo (sem jargão técnico).
 */
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
      <p className="text-base font-medium text-gray-700 dark:text-gray-300">{title}</p>
      {description && (
        <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {action}
    </div>
  );
}
