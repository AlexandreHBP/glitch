/**
 * Helper minimalista para concatenar classNames condicionais sem
 * adicionar dependências (clsx/tailwind-merge). Substitua por `clsx`
 * quando o projeto crescer e precisar de merge de classes Tailwind.
 */
export function cn(...inputs: Array<string | number | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
