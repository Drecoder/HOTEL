import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from './role.enum';

/**
 * SKELETON: Ensures a user is authenticated (logged in).
 * This must be replaced with your full JWT validation logic.
 */
@Injectable()
export class GqlAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    
    // --- TEMPORARY MOCKING FOR TESTING ---
    // You MUST replace this with logic that reads the user and their role
    // from the JWT token and attaches it to request.user.
    if (!request.user) {
        // Mock a user with FRONTDESK role for testing checkIn/checkOut
        request.user = { 
            id: 99, 
            role: Role.FRONTDESK, 
        };
    }
    // --- END MOCKING ---
    
    // Check if user object is present (simulating successful JWT validation)
    return !!request.user;
  }
}
