/**
 * Helpers de formatação usados nas telas do painel (moeda e data em
 * pt-BR). Mantidos separados de utils/index.ts (que é só o helper de
 * className) para não misturar responsabilidades.
 */

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
