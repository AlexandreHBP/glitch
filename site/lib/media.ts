/**
 * Resolve URLs de mídia (fotos de produto, áudio da playlist) devolvidas
 * pela API como caminho relativo (ex: "/uploads/images/x.webp"), servidas
 * pela raiz do backend — não pelo prefixo /api/v1. Ver
 * UploadsController/UploadsService no backend: `useStaticAssets` é
 * registrado antes do `setGlobalPrefix('api')`.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/v\d+\/?$/, "");

export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//.test(url)) return url;
  return `${BACKEND_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
}
