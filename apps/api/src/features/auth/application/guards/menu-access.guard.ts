import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionRepositoryInterface } from '../../domain/repositories/permission.repository.interface';

export const MENU_ACCESS_KEY = 'menuAccess';
export const RequireMenuAccess = (menuKey: string) =>
  SetMetadata(MENU_ACCESS_KEY, menuKey);

@Injectable()
export class MenuAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('PermissionRepositoryInterface')
    private permissionRepository: PermissionRepositoryInterface,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredMenuAccess = this.reflector.getAllAndOverride<string>(
      MENU_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredMenuAccess) {
      return true; // 메뉴 접근 요구사항이 없으면 통과
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasAccess = await this.permissionRepository.hasMenuAccess(user.id, requiredMenuAccess);

    if (!hasAccess) {
      throw new ForbiddenException(`Access denied to menu: ${requiredMenuAccess}`);
    }

    return true;
  }
}
