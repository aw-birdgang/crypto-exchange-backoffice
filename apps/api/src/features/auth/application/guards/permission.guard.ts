import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Resource, Permission } from '@crypto-exchange/shared';
import { PermissionRepositoryInterface } from '../../domain/repositories/permission.repository.interface';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (resource: Resource, permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, { resource, permissions });

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('PermissionRepositoryInterface')
    private permissionRepository: PermissionRepositoryInterface,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<{
      resource: Resource;
      permissions: Permission[];
    }>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) {
      return true; // 권한 요구사항이 없으면 통과
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasPermission = await this.permissionRepository.hasAnyPermission(
      user.id,
      requiredPermissions.resource,
      requiredPermissions.permissions,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.permissions.join(', ')} on ${requiredPermissions.resource}`,
      );
    }

    return true;
  }
}
