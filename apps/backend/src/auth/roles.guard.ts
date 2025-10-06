import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from './role.enum';
import { ROLES_KEY } from './roles.decorators';

/**
 * Authorizes access based on the user's role defined by the @Roles() decorator.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get the required roles set by the @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles defined, access granted (e.g., public endpoints)
    }

    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user; // Get the user object from the request

    // 2. Check if the user's role matches one of the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}