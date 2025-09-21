import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { AdminUserRole, Resource, Permission, UserPermissions, Role } from '@crypto-exchange/shared';
import { PermissionRepositoryInterface } from '../../domain/repositories/permission.repository.interface';
import { RoleRepositoryInterface } from '../../domain/repositories/role.repository.interface';
import { RolePermission } from '../../domain/entities/role-permission.entity';
import { IRoleMapper, MAPPER_TOKENS } from '../providers/mapper.providers';
import { RoleListResponseDto } from '../dto/permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @Inject('PermissionRepositoryInterface')
    private permissionRepository: PermissionRepositoryInterface,
    @Inject('RoleRepositoryInterface')
    private roleRepository: RoleRepositoryInterface,
    @Inject(MAPPER_TOKENS.ROLE_MAPPER)
    private roleMapper: IRoleMapper,
  ) {}

  async getUserPermissions(userId: string): Promise<UserPermissions> {
    try {
      // 입력 검증
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new Error('Invalid userId provided');
      }

      console.log('🚀 PermissionService: getUserPermissions called with userId:', userId);
      console.log('🔍 PermissionService: Calling permissionRepository.getUserPermissions...');
      
      const permissions = await this.permissionRepository.getUserPermissions(userId);
      
      // 응답 검증
      if (!permissions || !permissions.userId || !permissions.role) {
        throw new Error('Invalid permissions data received from repository');
      }

      console.log('✅ PermissionService: Successfully retrieved permissions:', {
        userId: permissions.userId,
        role: permissions.role,
        permissionsCount: permissions.permissions?.length || 0,
        resources: permissions.permissions?.map(p => p.resource) || []
      });
      
      return permissions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.error('❌ PermissionService: Error getting user permissions:', {
        userId,
        error: errorMessage,
        stack: errorStack
      });
      
      // 에러 타입에 따른 처리
      if (errorMessage.includes('User not found')) {
        throw new Error(`User not found: ${userId}`);
      } else if (errorMessage.includes('Failed to get user permissions')) {
        throw new Error(`Failed to retrieve permissions for user: ${userId}`);
      } else {
        throw new Error(`Unexpected error while getting user permissions: ${errorMessage}`);
      }
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

  async deleteRolePermission(id: string): Promise<void> {
    return this.permissionRepository.deleteRolePermission(id);
  }

  async getRolePermissions(role: AdminUserRole): Promise<RolePermission[]> {
    return this.permissionRepository.getRolePermissions(role);
  }

  async getAllRolePermissions(): Promise<RolePermission[]> {
    return this.permissionRepository.getAllRolePermissions();
  }

  async initializeDefaultPermissions(): Promise<void> {
    return this.permissionRepository.initializeDefaultPermissions();
  }

  // Role 관리 메서드들
  async getAllRoles(): Promise<RoleListResponseDto> {
    try {
      console.log('🔍 PermissionService: Getting all roles from repository...');
      const roles = await this.roleRepository.findAll();
      console.log('✅ PermissionService: Found roles:', roles.length);
      
      console.log('✅ PermissionService: Mapped roles successfully:', roles.length);
      return this.roleMapper.toRoleListResponseDto(roles, roles.length);
    } catch (error) {
      console.error('❌ PermissionService: Error in getAllRoles:', error);
      throw error;
    }
  }

  async getRoleById(id: string): Promise<Role | null> {
    const role = await this.roleRepository.findById(id);
    return role ? role.toRoleType() : null;
  }

  async getRoleByName(name: string): Promise<Role | null> {
    const role = await this.roleRepository.findByName(name);
    return role ? role.toRoleType() : null;
  }

  async createRole(roleData: Partial<Role>): Promise<Role> {
    console.log('🔍 PermissionService: Creating role with data:', JSON.stringify(roleData, null, 2));
    
    // 중복 검사: 같은 이름의 역할이 이미 존재하는지 확인
    if (roleData.name) {
      const existingRole = await this.roleRepository.findByName(roleData.name);
      if (existingRole) {
        console.log('❌ PermissionService: Role with name already exists:', roleData.name);
        throw new Error(`역할 이름 '${roleData.name}'이 이미 존재합니다.`);
      }
    }
    
    // permissions 필드를 제외하고 엔티티 생성
    const { permissions, ...entityData } = roleData as any;
    console.log('🔍 PermissionService: Entity data (after removing permissions):', JSON.stringify(entityData, null, 2));
    
    const role = await this.roleRepository.create(entityData);
    console.log('✅ PermissionService: Created role entity:', JSON.stringify(role, null, 2));
    
    const roleType = role.toRoleType();
    console.log('✅ PermissionService: Converted to RoleType:', JSON.stringify(roleType, null, 2));
    
    return roleType;
  }

  async updateRole(id: string, roleData: Partial<Role>): Promise<Role> {
    // 중복 검사: 같은 이름의 역할이 이미 존재하는지 확인 (자기 자신 제외)
    if (roleData.name) {
      const existingRole = await this.roleRepository.findByName(roleData.name);
      if (existingRole && existingRole.id !== id) {
        console.log('❌ PermissionService: Role with name already exists:', roleData.name);
        throw new Error(`역할 이름 '${roleData.name}'이 이미 존재합니다.`);
      }
    }
    
    // permissions 필드를 제외하고 엔티티 업데이트
    const { permissions, ...entityData } = roleData as any;
    const role = await this.roleRepository.update(id, entityData);
    
    return role.toRoleType();
  }

  async deleteRole(id: string): Promise<void> {
    await this.roleRepository.delete(id);
  }

  async createRolePermission(rolePermissionData: any): Promise<RolePermission> {
    // AdminUserRole을 Role 엔티티로 변환
    const role = await this.roleRepository.findByName(rolePermissionData.role);
    if (!role) {
      throw new Error(`Role not found: ${rolePermissionData.role}`);
    }
    
    const rolePermission = {
      ...rolePermissionData,
      role: role
    };
    
    return this.permissionRepository.createRolePermission(rolePermission);
  }

  async updateRolePermission(id: string, rolePermissionData: any): Promise<RolePermission> {
    // AdminUserRole을 Role 엔티티로 변환
    const role = await this.roleRepository.findByName(rolePermissionData.role);
    if (!role) {
      throw new Error(`Role not found: ${rolePermissionData.role}`);
    }
    
    const rolePermission = {
      ...rolePermissionData,
      role: role
    };
    
    return this.permissionRepository.updateRolePermission(id, rolePermission);
  }
}
