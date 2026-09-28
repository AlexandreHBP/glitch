/**
 * Marca uma rota como pública, liberando-a do JwtAuthGuard global.
 * Usado no catálogo, na playlist pública e nas rotas de autenticação
 * (login/register), conforme "Autenticação e Autorização" da arquitetura.
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): ReturnType<typeof SetMetadata> =>
  SetMetadata(IS_PUBLIC_KEY, true);
