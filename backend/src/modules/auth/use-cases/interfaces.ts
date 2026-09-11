/**
 * Interfaces segregadas do módulo de autenticação — cada uma com um único
 * método, seguindo o padrão de use-cases da casa.
 */
import { User } from '../../users/entities/user.entity';

export interface AuthResult {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface Login {
  login(email: string, password: string): Promise<AuthResult>;
}

export interface RegisterCustomer {
  registerCustomer(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResult>;
}

export interface GetCurrentUser {
  getCurrentUser(userId: string): Promise<User>;
}
