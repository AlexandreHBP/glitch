/**
 * Marca uma rota (ou controller inteiro) como exigindo um dos papéis
 * informados. Usado sempre em conjunto com o RolesGuard, aplicado na
 * classe inteira dos controllers /admin/* (nunca método a método).
 */
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/users/enums/user-role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(ROLES_KEY, roles);
