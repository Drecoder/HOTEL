import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
/**
 * Decorator used on GraphQL resolvers to specify the required user roles
 * for authorization.
 * e.g., @Roles(Role.FRONTDESK)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);