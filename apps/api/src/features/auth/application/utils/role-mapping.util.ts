import { AdminUserRole } from '@crypto-exchange/shared';

/**
 * 역할 매핑 관련 유틸리티
 */
export class RoleMappingUtil {
  /**
   * AdminUserRole을 역할 이름으로 변환
   */
  static mapAdminRoleToRoleName(adminRole: AdminUserRole): string {
    const roleMapping: Record<AdminUserRole, string> = {
      [AdminUserRole.SUPER_ADMIN]: 'super_admin',
      [AdminUserRole.ADMIN]: 'admin',
      [AdminUserRole.MODERATOR]: 'moderator',
      [AdminUserRole.SUPPORT]: 'support',
      [AdminUserRole.AUDITOR]: 'auditor',
    };

    return roleMapping[adminRole] || 'support'; // 기본값
  }

  /**
   * 역할 이름을 AdminUserRole로 변환
   */
  static mapRoleNameToAdminRole(roleName: string): AdminUserRole {
    const reverseMapping: Record<string, AdminUserRole> = {
      'super_admin': AdminUserRole.SUPER_ADMIN,
      'admin': AdminUserRole.ADMIN,
      'moderator': AdminUserRole.MODERATOR,
      'support': AdminUserRole.SUPPORT,
      'auditor': AdminUserRole.AUDITOR,
    };

    return reverseMapping[roleName] || AdminUserRole.SUPPORT; // 기본값
  }

  /**
   * AdminUserRole이 유효한지 검증
   */
  static isValidAdminRole(role: string): role is AdminUserRole {
    return Object.values(AdminUserRole).includes(role as AdminUserRole);
  }

  /**
   * 역할 이름이 유효한지 검증
   */
  static isValidRoleName(roleName: string): boolean {
    const validRoleNames = ['super_admin', 'admin', 'moderator', 'support', 'auditor'];
    return validRoleNames.includes(roleName);
  }

  /**
   * 사용자 역할 정보 생성
   */
  static createUserRoleInfo(adminRole: AdminUserRole) {
    return {
      roleName: this.mapAdminRoleToRoleName(adminRole),
      adminRole,
    };
  }
}
