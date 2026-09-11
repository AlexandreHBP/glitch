/**
 * Extrai o usuário autenticado (injetado pelo JwtStrategy em req.user)
 * diretamente como parâmetro do controller, evitando repetir
 * `@Request() req` e `req.user` em cada handler.
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    return request.user;
  },
);
