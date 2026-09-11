/**
 * Helpers puros de formatação (moeda e data) usados em catálogo, carrinho e
 * pedidos. Centralizados aqui para manter o formato consistente com o
 * fuso America/Sao_Paulo e o real brasileiro.
 */
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatPrice(value: number): string {
  return currencyFormatter.format(value);
}

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeZone: "America/Sao_Paulo",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
