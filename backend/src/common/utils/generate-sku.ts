/**
 * Gera um SKU legível a partir do slug do produto + tamanho/cor da
 * variação, com um sufixo aleatório para evitar colisão. Extraído de
 * create-product.usecase.ts/update-product.usecase.ts, que tinham a
 * mesma lógica duplicada byte a byte.
 */
import { slugify } from './slugify';

export function generateSku(slug: string, size: string, color: string): string {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${slug.slice(0, 15).toUpperCase()}-${slugify(size).toUpperCase()}-${slugify(color).toUpperCase()}-${random}`;
}
