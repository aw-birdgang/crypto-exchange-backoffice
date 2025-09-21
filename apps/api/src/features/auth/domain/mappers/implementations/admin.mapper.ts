import { AdminUser } from '../../entities/admin-user.entity';
import { AdminStatsDto, AdminDashboardDto } from '../../../application/dto/admin.dto';
import { AdminUserRole } from '@crypto-exchange/shared';
import { 
  IAdminMapper, 
  AdminStatsData, 
  ActivityData, 
  SystemStatusData, 
  UserListResponse, 
  UserSummary, 
  BulkActionResponse, 
  ActivityContext, 
  ActivityLog 
} from '../interfaces/admin.mapper.interface';

/**
 * 관리자 관련 매핑 구현체
 */
export class AdminMapper implements IAdminMapper {
  /**
   * 통계 데이터 생성
   */
  toAdminStatsDto(stats: AdminStatsData): AdminStatsDto {
    return {
      totalUsers: stats.totalUsers,
      activeUsers: stats.activeUsers,
      adminCount: stats.adminCount,
      todayRegistrations: stats.todayRegistrations,
      weeklyRegistrations: stats.weeklyRegistrations,
      monthlyRegistrations: stats.monthlyRegistrations,
      roleStats: stats.roleStats,
    };
  }

  /**
   * 대시보드 데이터 생성
   */
  toAdminDashboardDto(
    stats: AdminStatsDto,
    recentActivities: ActivityData[],
    systemStatus: SystemStatusData
  ): AdminDashboardDto {
    return {
      stats,
      recentActivities,
      systemStatus,
    };
  }

  /**
   * 사용자 목록 응답 생성
   */
  toUserListResponseDto(users: AdminUser[], total: number): UserListResponse {
    return {
      users: users.map(user => this.toUserSummary(user)),
      total,
    };
  }

  /**
   * 대량 작업 결과 생성
   */
  toBulkActionResponse(success: number, failed: number, errors: string[]): BulkActionResponse {
    return {
      success,
      failed,
      errors,
    };
  }

  /**
   * 관리자 활동 로그 생성
   */
  toActivityLog(admin: AdminUser, action: string, context: ActivityContext): ActivityLog {
    return {
      id: this.generateActivityId(),
      adminId: admin.id,
      adminEmail: admin.email,
      action,
      resourceId: context.resourceId,
      resourceType: context.resourceType,
      timestamp: new Date().toISOString(),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: context.metadata,
    };
  }

  /**
   * 사용자 요약 정보 생성
   */
  private toUserSummary(user: AdminUser): UserSummary {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.adminRole,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * 활동 ID 생성
   */
  private generateActivityId(): string {
    return `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 역할별 기본 권한 설정 (기존 PermissionMappingUtil 로직 통합)
   */
  getDefaultPermissions(role: AdminUserRole): string[] {
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
  getRoleLevel(role: AdminUserRole): number {
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
  hasHigherOrEqualLevel(role1: AdminUserRole, role2: AdminUserRole): boolean {
    return this.getRoleLevel(role1) >= this.getRoleLevel(role2);
  }

  /**
   * 역할이 시스템 관리자 권한을 가지는지 확인
   */
  isSystemAdmin(role: AdminUserRole): boolean {
    return role === AdminUserRole.SUPER_ADMIN || role === AdminUserRole.ADMIN;
  }

  /**
   * 역할이 사용자 관리 권한을 가지는지 확인
   */
  canManageUsers(role: AdminUserRole): boolean {
    return [
      AdminUserRole.SUPER_ADMIN,
      AdminUserRole.ADMIN,
      AdminUserRole.MODERATOR
    ].includes(role);
  }
}
