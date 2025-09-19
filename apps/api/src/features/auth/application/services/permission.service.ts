import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { UserRole, Resource, Permission, UserPermissions, Role } from '@crypto-exchange/shared';
import { PermissionRepositoryInterface } from '../../domain/repositories/permission.repository.interface';
import { RoleRepositoryInterface } from '../../domain/repositories/role.repository.interface';
import { RolePermission } from '../../domain/entities/role-permission.entity';
import { CacheService } from '../../../../common/cache/cache.service';

@Injectable()
export class PermissionService {
  constructor(
    @Inject('PermissionRepositoryInterface')
    private permissionRepository: PermissionRepositoryInterface,
    @Inject('RoleRepositoryInterface')
    private roleRepository: RoleRepositoryInterface,
    private cacheService: CacheService,
  ) {}

  async getUserPermissions(userId: string): Promise<UserPermissions> {
    try {
      const cacheKey = CacheService.generateKey('user_permissions', userId);
      
      // 캐시에서 먼저 확인
      const cachedPermissions = await this.cacheService.get<UserPermissions>(cacheKey);
      if (cachedPermissions) {
        console.log('✅ PermissionService: Retrieved permissions from cache for user:', userId);
        return cachedPermissions;
      }

      console.log('🚀 PermissionService: getUserPermissions called with userId:', userId);
      console.log('🔍 PermissionService: Calling permissionRepository.getUserPermissions...');
      const permissions = await this.permissionRepository.getUserPermissions(userId);
      
      // 캐시에 저장 (30분 TTL)
      await this.cacheService.set(cacheKey, permissions, CacheService.TTL.MEDIUM);
      
      console.log('✅ PermissionService: Successfully retrieved permissions:', {
        userId: permissions.userId,
        role: permissions.role,
        permissionsCount: permissions.permissions?.length || 0
      });
      return permissions;
    } catch (error) {
      console.error('❌ PermissionService: Error getting user permissions:', error);
      throw error;
    }
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

  // Role 관리 메서드들
  async getAllRoles(): Promise<Role[]> {
    try {
      const cacheKey = 'all_roles';
      
      // 캐시에서 먼저 확인
      const cachedRoles = await this.cacheService.get<Role[]>(cacheKey);
      if (cachedRoles) {
        console.log('✅ PermissionService: Retrieved roles from cache');
        return cachedRoles;
      }

      console.log('🔍 PermissionService: Getting all roles from repository...');
      const roles = await this.roleRepository.findAll();
      console.log('✅ PermissionService: Found roles:', roles.length);
      
      const mappedRoles = roles.map(role => {
        console.log('🔍 PermissionService: Mapping role:', role.name);
        return role.toRoleType();
      });
      
      // 캐시에 저장 (1시간 TTL)
      await this.cacheService.set(cacheKey, mappedRoles, CacheService.TTL.LONG);
      
      console.log('✅ PermissionService: Mapped roles successfully:', mappedRoles.length);
      return mappedRoles;
    } catch (error) {
      console.error('❌ PermissionService: Error in getAllRoles:', error);
      throw error;
    }
  }

  async getRoleById(id: string): Promise<Role | null> {
    const role = await this.roleRepository.findById(id);
    return role ? role.toRoleType() : null;
  }

  async createRole(roleData: Partial<Role>): Promise<Role> {
    // permissions 필드를 제외하고 엔티티 생성
    const { permissions, ...entityData } = roleData as any;
    const role = await this.roleRepository.create(entityData);
    return role.toRoleType();
  }

  async updateRole(id: string, roleData: Partial<Role>): Promise<Role> {
    // permissions 필드를 제외하고 엔티티 업데이트
    const { permissions, ...entityData } = roleData as any;
    const role = await this.roleRepository.update(id, entityData);
    return role.toRoleType();
  }

  async deleteRole(id: string): Promise<void> {
    return this.roleRepository.delete(id);
  }
}
