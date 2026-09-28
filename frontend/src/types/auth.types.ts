/**
 * Tipos do domínio de autenticação, espelhando exatamente o que o backend
 * devolve em POST /auth/login e GET /auth/me (ver
 * backend/src/modules/auth/).
 */

export type UserRole = "customer" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResult {
  accessToken: string;
  user: AuthUser;
}
