/**
 * Gera um slug URL-friendly a partir de um texto (ex: nome de produto ou
 * categoria), removendo acentos e caracteres especiais.
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
