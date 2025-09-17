import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole, Resource, Permission, UserPermissions, ROLE_PERMISSIONS, MENU_PERMISSIONS } from '@crypto-exchange/shared';
import { RolePermission } from '../../domain/entities/role-permission.entity';
import { PermissionRepositoryInterface } from '../../domain/repositories/permission.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class PermissionRepository implements PermissionRepositoryInterface {
  constructor(
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserPermissions(userId: string): Promise<UserPermissions> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const rolePermissions = await this.rolePermissionRepository.find({
      where: { role: user.role },
    });

    const permissions = rolePermissions.map(rp => ({
      resource: rp.resource,
      permissions: rp.permissions,
    }));

    return {
      userId,
      role: user.role,
      permissions,
    };
  }

  async hasPermission(userId: string, resource: Resource, permission: Permission): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    // SUPER_ADMIN은 모든 권한을 가짐
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    const rolePermission = await this.rolePermissionRepository.findOne({
      where: { role: user.role, resource },
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
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    const allowedRoles = MENU_PERMISSIONS[menuKey as keyof typeof MENU_PERMISSIONS];
    return allowedRoles ? allowedRoles.includes(user.role as any) : false;
  }

  async createRolePermission(rolePermission: Partial<RolePermission>): Promise<RolePermission> {
    const newRolePermission = this.rolePermissionRepository.create(rolePermission);
    return this.rolePermissionRepository.save(newRolePermission);
  }

  async updateRolePermission(id: string, rolePermission: Partial<RolePermission>): Promise<RolePermission> {
    await this.rolePermissionRepository.update(id, rolePermission);
    return this.rolePermissionRepository.findOne({ where: { id } });
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
    const existingPermissions = await this.rolePermissionRepository.count();
    if (existingPermissions > 0) {
      return; // 이미 초기화됨
    }

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
}
