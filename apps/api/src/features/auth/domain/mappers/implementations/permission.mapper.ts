import { RolePermission } from '../../entities/role-permission.entity';
import { PermissionCheckResponseDto, MenuAccessResponseDto } from '../../../application/dto/permission.dto';
import { UserPermissions, AdminUserRole } from '@crypto-exchange/shared';
import { 
  IPermissionMapper, 
  PermissionInfo 
} from '../interfaces/permission.mapper.interface';

/**
 * 권한 관련 매핑 구현체
 */
export class PermissionMapper implements IPermissionMapper {
  /**
   * 권한 확인 응답 생성
   */
  toPermissionCheckResponse(hasPermission: boolean): PermissionCheckResponseDto {
    return {
      hasPermission,
    };
  }

  /**
   * 메뉴 접근 응답 생성
   */
  toMenuAccessResponse(hasAccess: boolean): MenuAccessResponseDto {
    return {
      hasAccess,
    };
  }

  /**
   * 사용자 권한 정보 생성
   */
  toUserPermissions(userPermissions: UserPermissions): UserPermissions {
    return {
      ...userPermissions,
    };
  }

  /**
   * RolePermission을 권한 정보로 변환
   */
  toPermissionInfo(rolePermission: RolePermission): PermissionInfo {
    return {
      id: rolePermission.id,
      role: rolePermission.role?.name || 'unknown',
      resource: rolePermission.resource,
      permissions: rolePermission.permissions,
      createdAt: rolePermission.createdAt.toISOString(),
      updatedAt: rolePermission.updatedAt.toISOString(),
    };
  }

  /**
   * RolePermission 배열을 권한 정보 배열로 변환
   */
  toPermissionInfoList(rolePermissions: RolePermission[]): PermissionInfo[] {
    return rolePermissions.map(permission => this.toPermissionInfo(permission));
  }

  /**
   * 역할별 기본 권한 설정
   */
  getDefaultPermissions(role: string): string[] {
    const roleEnum = this.mapStringToAdminUserRole(role);
    const permissionMap: Record<AdminUserRole, string[]> = {
      [AdminUserRole.SUPER_ADMIN]: [
        'users:read', 'users:create', 'users:update', 'users:delete',
        'system:configure', 'notifications:read', 'notifications:create', 
        'notifications:delete', 'logs:read', 'system:restart', 
        'cache:manage', 'database:manage', 'roles:manage', 
        'permissions:assign', 'users:change_role'
      ],
      [AdminUserRole.ADMIN]: [
        'users:read', 'users:create', 'users:update', 'users:suspend',
        'users:ban', 'users:change_role', 'system:configure',
        'notifications:read', 'notifications:create', 'notifications:delete',
        'logs:read', 'cache:manage'
      ],
      [AdminUserRole.MODERATOR]: [
        'users:read', 'users:suspend', 'users:ban', 'notifications:read',
        'notifications:create', 'logs:read'
      ],
      [AdminUserRole.SUPPORT]: [
        'users:read', 'notifications:read', 'notifications:create'
      ],
      [AdminUserRole.AUDITOR]: [
        'users:read', 'logs:read', 'system:read'
      ],
    };

    return permissionMap[roleEnum] || [];
  }

  /**
   * 역할별 권한 레벨 확인
   */
  getRoleLevel(role: string): number {
    const roleEnum = this.mapStringToAdminUserRole(role);
    const levelMap: Record<AdminUserRole, number> = {
      [AdminUserRole.SUPER_ADMIN]: 5,
      [AdminUserRole.ADMIN]: 4,
      [AdminUserRole.MODERATOR]: 3,
      [AdminUserRole.SUPPORT]: 2,
      [AdminUserRole.AUDITOR]: 1,
    };

    return levelMap[roleEnum] || 0;
  }

  /**
   * 역할 권한 레벨 비교
   */
  hasHigherOrEqualLevel(role1: string, role2: string): boolean {
    return this.getRoleLevel(role1) >= this.getRoleLevel(role2);
  }

  /**
   * 역할이 시스템 관리자 권한을 가지는지 확인
   */
  isSystemAdmin(role: string): boolean {
    const roleEnum = this.mapStringToAdminUserRole(role);
    return roleEnum === AdminUserRole.SUPER_ADMIN || roleEnum === AdminUserRole.ADMIN;
  }

  /**
   * 역할이 사용자 관리 권한을 가지는지 확인
   */
  canManageUsers(role: string): boolean {
    const roleEnum = this.mapStringToAdminUserRole(role);
    return [
      AdminUserRole.SUPER_ADMIN,
      AdminUserRole.ADMIN,
      AdminUserRole.MODERATOR
    ].includes(roleEnum);
  }

  /**
   * 문자열을 AdminUserRole로 변환
   */
  private mapStringToAdminUserRole(role: string): AdminUserRole {
    const roleMapping: Record<string, AdminUserRole> = {
      'super_admin': AdminUserRole.SUPER_ADMIN,
      'admin': AdminUserRole.ADMIN,
      'moderator': AdminUserRole.MODERATOR,
      'support': AdminUserRole.SUPPORT,
      'auditor': AdminUserRole.AUDITOR,
    };
    
    return roleMapping[role] || AdminUserRole.SUPPORT;
  }
}
