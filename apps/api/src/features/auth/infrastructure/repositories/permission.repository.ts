import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole, Resource, Permission, UserPermissions, ROLE_PERMISSIONS, MENU_PERMISSIONS } from '@crypto-exchange/shared';
import { RolePermission } from '../../domain/entities/role-permission.entity';
import { PermissionRepositoryInterface } from '../../domain/repositories/permission.repository.interface';
import { AdminUser } from '../../domain/entities/admin-user.entity';

@Injectable()
export class PermissionRepository implements PermissionRepositoryInterface {
  constructor(
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
  ) {}

  async getUserPermissions(userId: string): Promise<UserPermissions> {
    console.log('🚀 PermissionRepository: getUserPermissions called with userId:', userId);
    console.log('🔍 PermissionRepository: User ID type:', typeof userId);
    console.log('🔍 PermissionRepository: User ID length:', userId.length);
    
    const user = await this.adminUserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      console.error('❌ PermissionRepository: User not found for userId:', userId);
      console.error('❌ PermissionRepository: Searching for user with exact ID:', userId);
      throw new Error('User not found');
    }

    console.log('✅ PermissionRepository: User found:', {
      id: user.id,
      email: user.email,
      adminRole: user.adminRole
    });

    // AdminRole을 UserRole로 매핑
    const userRole = this.mapAdminRoleToUserRole(user.adminRole);
    console.log('🔍 PermissionRepository: Mapped userRole:', userRole);
    
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { role: userRole },
    });

    console.log('🔍 PermissionRepository: Found rolePermissions:', rolePermissions.length);

    const permissions = rolePermissions.map(rp => ({
      resource: rp.resource,
      permissions: rp.permissions,
    }));

    console.log('✅ PermissionRepository: Returning permissions:', {
      userId,
      role: userRole,
      permissionsCount: permissions.length
    });

    return {
      userId,
      role: userRole,
      permissions,
    };
  }

  async hasPermission(userId: string, resource: Resource, permission: Permission): Promise<boolean> {
    const user = await this.adminUserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    // SUPER_ADMIN은 모든 권한을 가짐
    if (user.adminRole === 'SUPER_ADMIN') {
      return true;
    }

    const userRole = this.mapAdminRoleToUserRole(user.adminRole);
    
    const rolePermission = await this.rolePermissionRepository.findOne({
      where: { role: userRole, resource },
    });

    if (!rolePermission) {
      return false;
    }

    return rolePermission.permissions.includes(permission) || 
           rolePermission.permissions.includes(Permission.MANAGE);
  }

  async hasAnyPermission(userId: string, resource: Resource, permissions: Permission[]): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(userId, resource, permission)) {
        return true;
      }
    }
    return false;
  }

  async hasMenuAccess(userId: string, menuKey: string): Promise<boolean> {
    const user = await this.adminUserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    const userRole = this.mapAdminRoleToUserRole(user.adminRole);
    const allowedRoles = MENU_PERMISSIONS[menuKey as keyof typeof MENU_PERMISSIONS];
    return allowedRoles ? allowedRoles.includes(userRole as any) : false;
  }

  async createRolePermission(rolePermission: Partial<RolePermission>): Promise<RolePermission> {
    const newRolePermission = this.rolePermissionRepository.create(rolePermission);
    return this.rolePermissionRepository.save(newRolePermission);
  }

  async updateRolePermission(id: string, rolePermission: Partial<RolePermission>): Promise<RolePermission> {
    await this.rolePermissionRepository.update(id, rolePermission);
    const updated = await this.rolePermissionRepository.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`RolePermission with id ${id} not found`);
    }
    return updated;
  }

  async deleteRolePermission(id: string): Promise<void> {
    await this.rolePermissionRepository.delete(id);
  }

  async getRolePermissions(role: UserRole): Promise<RolePermission[]> {
    return this.rolePermissionRepository.find({
      where: { role },
    });
  }

  async getAllRolePermissions(): Promise<RolePermission[]> {
    return this.rolePermissionRepository.find();
  }

  // 초기 권한 데이터 설정
  async initializeDefaultPermissions(): Promise<void> {
    // 기존 권한을 모두 삭제하고 새로 생성
    await this.rolePermissionRepository.clear();
    console.log('🗑️ Cleared existing role permissions');

    const defaultPermissions: Partial<RolePermission>[] = [];

    // ROLE_PERMISSIONS 상수를 기반으로 기본 권한 생성
    Object.entries(ROLE_PERMISSIONS).forEach(([roleKey, roleData]) => {
      Object.entries(roleData.permissions).forEach(([resource, permissions]) => {
        defaultPermissions.push({
          role: roleData.role as UserRole,
          resource: resource as Resource,
          permissions: permissions as Permission[],
        });
      });
    });

    await this.rolePermissionRepository.save(defaultPermissions);
  }

  /**
   * AdminRole을 UserRole로 매핑
   */
  private mapAdminRoleToUserRole(adminRole: string): UserRole {
    switch (adminRole) {
      case 'SUPER_ADMIN':
        return UserRole.SUPER_ADMIN;
      case 'ADMIN':
        return UserRole.ADMIN;
      default:
        return UserRole.USER;
    }
  }
}
