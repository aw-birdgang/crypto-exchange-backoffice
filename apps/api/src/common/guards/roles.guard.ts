import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminUserRole } from '@crypto-exchange/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminUserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    const hasRole = requiredRoles.some((role) => user.adminRole === role);

    if (!hasRole) {
      console.log('❌ RolesGuard: Insufficient permissions:', {
        userRole: user.adminRole,
        requiredRoles,
        userId: user.id,
        email: user.email
      });
      
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. Your role: ${user.adminRole}`
      );
    }

    console.log('✅ RolesGuard: Access granted:', {
      userRole: user.adminRole,
      requiredRoles,
      userId: user.id
    });

    return true;
  }
}
