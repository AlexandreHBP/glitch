/**
 * Cliente HTTP central da loja Glitch. Toda chamada à API do backend passa
 * por aqui — nenhum `fetch` solto deve existir em componentes ou páginas.
 * Lê o token do cliente logado do localStorage quando executado no browser
 * e injeta o header Authorization automaticamente.
 */
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1").replace(
  /\/$/,
  "",
);

export const TOKEN_STORAGE_KEY = "glitch.token";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Sobrescreve o token lido do localStorage (ex: null para chamada anônima). */
  token?: string | null;
  /** Repassado ao fetch do Next para cache/revalidação em Server Components. */
  next?: { revalidate?: number | false; tags?: string[] };
  cache?: RequestCache;
  signal?: AbortSignal;
};

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function extractMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message: unknown }).message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
  }
  return fallback;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = "GET", body, token, next, cache, signal } = options;
  const authToken = token !== undefined ? token : readStoredToken();

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache,
      next,
      signal,
    } as RequestInit);
  } catch {
    throw new ApiError(0, "Não foi possível conectar à API da loja. Tente novamente.");
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      extractMessage(data, response.statusText || "Erro ao comunicar com a API"),
      data,
    );
  }

  return data as T;
}
