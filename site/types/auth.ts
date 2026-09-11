/**
 * Tipos de autenticação — espelham AuthResult do backend
 * (src/modules/auth/use-cases/interfaces.ts) e UserRole.
 */
export type UserRole = "customer" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthResult = {
  accessToken: string;
  user: AuthUser;
};
