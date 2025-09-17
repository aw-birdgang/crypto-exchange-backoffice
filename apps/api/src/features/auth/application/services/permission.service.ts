import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { UserRole, Resource, Permission, UserPermissions } from '@crypto-exchange/shared';
import { PermissionRepositoryInterface } from '../../domain/repositories/permission.repository.interface';
import { RolePermission } from '../../domain/entities/role-permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @Inject('PermissionRepositoryInterface')
    private permissionRepository: PermissionRepositoryInterface,
  ) {}

  async getUserPermissions(userId: string): Promise<UserPermissions> {
    return this.permissionRepository.getUserPermissions(userId);
  }

  async hasPermission(userId: string, resource: Resource, permission: Permission): Promise<boolean> {
    return this.permissionRepository.hasPermission(userId, resource, permission);
  }

  async hasAnyPermission(userId: string, resource: Resource, permissions: Permission[]): Promise<boolean> {
    return this.permissionRepository.hasAnyPermission(userId, resource, permissions);
  }

  async hasMenuAccess(userId: string, menuKey: string): Promise<boolean> {
    return this.permissionRepository.hasMenuAccess(userId, menuKey);
  }

  async checkPermission(userId: string, resource: Resource, permission: Permission): Promise<void> {
    const hasPermission = await this.hasPermission(userId, resource, permission);
    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${permission} on ${resource}`,
      );
    }
  }

  async checkAnyPermission(userId: string, resource: Resource, permissions: Permission[]): Promise<void> {
    const hasAnyPermission = await this.hasAnyPermission(userId, resource, permissions);
    if (!hasAnyPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required one of: ${permissions.join(', ')} on ${resource}`,
      );
    }
  }

  async checkMenuAccess(userId: string, menuKey: string): Promise<void> {
    const hasAccess = await this.hasMenuAccess(userId, menuKey);
    if (!hasAccess) {
      throw new ForbiddenException(`Access denied to menu: ${menuKey}`);
    }
  }

  // 권한 관리 CRUD
  async createRolePermission(rolePermission: Partial<RolePermission>): Promise<RolePermission> {
    return this.permissionRepository.createRolePermission(rolePermission);
  }

  async updateRolePermission(id: string, rolePermission: Partial<RolePermission>): Promise<RolePermission> {
    return this.permissionRepository.updateRolePermission(id, rolePermission);
  }

  async deleteRolePermission(id: string): Promise<void> {
    return this.permissionRepository.deleteRolePermission(id);
  }

  async getRolePermissions(role: UserRole): Promise<RolePermission[]> {
    return this.permissionRepository.getRolePermissions(role);
  }

  async getAllRolePermissions(): Promise<RolePermission[]> {
    return this.permissionRepository.getAllRolePermissions();
  }

  async initializeDefaultPermissions(): Promise<void> {
    return this.permissionRepository.initializeDefaultPermissions();
  }
}
