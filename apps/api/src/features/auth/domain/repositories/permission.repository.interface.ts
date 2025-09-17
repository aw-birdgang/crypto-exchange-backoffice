import { UserRole, Resource, Permission, UserPermissions } from '@crypto-exchange/shared';
import { RolePermission } from '../entities/role-permission.entity';

export interface PermissionRepositoryInterface {
  getUserPermissions(userId: string): Promise<UserPermissions>;
  hasPermission(userId: string, resource: Resource, permission: Permission): Promise<boolean>;
  hasAnyPermission(userId: string, resource: Resource, permissions: Permission[]): Promise<boolean>;
  hasMenuAccess(userId: string, menuKey: string): Promise<boolean>;
  createRolePermission(rolePermission: Partial<RolePermission>): Promise<RolePermission>;
  updateRolePermission(id: string, rolePermission: Partial<RolePermission>): Promise<RolePermission>;
  deleteRolePermission(id: string): Promise<void>;
  getRolePermissions(role: UserRole): Promise<RolePermission[]>;
  getAllRolePermissions(): Promise<RolePermission[]>;
  initializeDefaultPermissions(): Promise<void>;
}
