import { AdminUserRole } from '@crypto-exchange/shared';

/**
 * 권한 매핑 관련 유틸리티
 */
export class PermissionMappingUtil {
  /**
   * 역할별 기본 권한 설정
   */
  static getDefaultPermissions(role: AdminUserRole): string[] {
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

    return permissionMap[role] || [];
  }

  /**
   * 역할별 권한 레벨 확인
   */
  static getRoleLevel(role: AdminUserRole): number {
    const levelMap: Record<AdminUserRole, number> = {
      [AdminUserRole.SUPER_ADMIN]: 5,
      [AdminUserRole.ADMIN]: 4,
      [AdminUserRole.MODERATOR]: 3,
      [AdminUserRole.SUPPORT]: 2,
      [AdminUserRole.AUDITOR]: 1,
    };

    return levelMap[role] || 0;
  }

  /**
   * 역할 권한 레벨 비교
   */
  static hasHigherOrEqualLevel(role1: AdminUserRole, role2: AdminUserRole): boolean {
    return this.getRoleLevel(role1) >= this.getRoleLevel(role2);
  }

  /**
   * 역할이 시스템 관리자 권한을 가지는지 확인
   */
  static isSystemAdmin(role: AdminUserRole): boolean {
    return role === AdminUserRole.SUPER_ADMIN || role === AdminUserRole.ADMIN;
  }

  /**
   * 역할이 사용자 관리 권한을 가지는지 확인
   */
  static canManageUsers(role: AdminUserRole): boolean {
    return [
      AdminUserRole.SUPER_ADMIN,
      AdminUserRole.ADMIN,
      AdminUserRole.MODERATOR
    ].includes(role);
  }
}
