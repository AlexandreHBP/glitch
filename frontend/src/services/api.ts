/**
 * Instância central do axios usada por todos os services do painel admin.
 *
 * - baseURL já inclui o prefixo de versão da API (/api/v1), decisão tomada
 *   propositalmente para este projeto porque o painel é uma aplicação única
 *   e pequena (ver ./.rules e o relatório final do desenvolvedor).
 * - Interceptor de request injeta o token salvo em localStorage.
 * - Interceptor de response limpa a sessão em 401 e dispara o evento
 *   `auth:unauthorized` em vez de forçar `window.location.href` (que
 *   recarregava a SPA inteira e perdia o estado do React Router). Quem
 *   escuta o evento e navega de fato é <UnauthorizedHandler> em App.tsx,
 *   que roda dentro do <Router> e pode usar useNavigate().
 */
import axios, { AxiosError } from "axios";

export const AUTH_TOKEN_KEY = "glitch.admin.token";
export const UNAUTHORIZED_EVENT = "auth:unauthorized";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

/** Origem "crua" do backend (sem /api/v1), usada para resolver URLs
 * relativas de arquivos enviados (/uploads/imagens/...). */
export const apiOrigin =
  import.meta.env.VITE_API_ORIGIN ?? baseURL.replace(/\/api\/v1\/?$/, "");

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      if (window.location.pathname !== "/login") {
        window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
      }
    }
    return Promise.reject(error);
  }
);

/** Resolve uma URL de arquivo devolvida pelo backend (relativa, ex.
 * "/uploads/images/x.webp") contra a origem do servidor, nunca contra o
 * prefixo /api/v1. */
export function resolveFileUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  return `${apiOrigin}${url.startsWith("/") ? url : `/${url}`}`;
}

interface ApiErrorBody {
  message?: string | string[];
}

/** Extrai uma mensagem de erro legível de qualquer erro de chamada à API,
 * incluindo os arrays de validação do class-validator. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorBody | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(", ") : data.message;
    }
    if (error.request && !error.response) {
      return "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}
