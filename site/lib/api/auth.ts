/**
 * Serviço de autenticação — POST /auth/login, POST /auth/register,
 * GET /auth/me. O token JWT é responsabilidade do AuthContext (localStorage).
 */
import { apiFetch } from "./client";
import type { AuthResult, AuthUser } from "@/types/auth";

export const authApi = {
  login(email: string, password: string) {
    return apiFetch<AuthResult>("/auth/login", {
      method: "POST",
      body: { email, password },
      token: null,
    });
  },
  register(name: string, email: string, password: string) {
    return apiFetch<AuthResult>("/auth/register", {
      method: "POST",
      body: { name, email, password },
      token: null,
    });
  },
  me(token: string) {
    return apiFetch<AuthUser>("/auth/me", { token });
  },
};
