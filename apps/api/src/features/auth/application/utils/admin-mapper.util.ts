import { AdminUser } from '../../domain/entities/admin-user.entity';
import { AdminStatsDto, AdminDashboardDto } from '../dto/admin.dto';

/**
 * 관리자 관련 매핑 유틸리티 함수
 */
export class AdminMapper {
  /**
   * 통계 데이터 생성
   */
  static toAdminStatsDto(stats: {
    totalUsers: number;
    activeUsers: number;
    adminCount: number;
    todayRegistrations: number;
    weeklyRegistrations: number;
    monthlyRegistrations: number;
    roleStats: Record<string, number>;
  }): AdminStatsDto {
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
  static toAdminDashboardDto(
    stats: AdminStatsDto,
    recentActivities: Array<{
      id: string;
      action: string;
      user: string;
      timestamp: string;
      details: string;
    }>,
    systemStatus: {
      database: string;
      redis: string;
      api: string;
    }
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
  static toUserListResponseDto(users: AdminUser[], total: number) {
    return {
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.adminRole,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt?.toISOString() || '',
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      total,
    };
  }

  /**
   * 대량 작업 결과 생성
   */
  static toBulkActionResponse(success: number, failed: number, errors: string[]) {
    return {
      success,
      failed,
      errors,
    };
  }
}
