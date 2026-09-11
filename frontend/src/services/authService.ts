/**
 * Chamadas de autenticação do admin: login e obtenção do usuário atual.
 * Não existe cadastro de admin pelo painel — a única conta é criada por
 * seed no backend.
 */
import { api } from "./api";
import type { AuthResult, AuthUser, LoginPayload } from "../types/auth.types";

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResult> => {
    const response = await api.post<AuthResult>("/auth/login", payload);
    return response.data;
  },

  me: async (): Promise<AuthUser> => {
    const response = await api.get<AuthUser>("/auth/me");
    return response.data;
  },
};
