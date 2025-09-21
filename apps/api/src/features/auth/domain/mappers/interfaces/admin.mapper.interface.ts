import { AdminUser } from '../../entities/admin-user.entity';
import { AdminStatsDto, AdminDashboardDto } from '../../../application/dto/admin.dto';
import { AdminUserRole } from '@crypto-exchange/shared';

/**
 * 관리자 관련 매핑 인터페이스
 */
export interface IAdminMapper {
  /**
   * 통계 데이터 생성
   */
  toAdminStatsDto(stats: AdminStatsData): AdminStatsDto;

  /**
   * 대시보드 데이터 생성
   */
  toAdminDashboardDto(
    stats: AdminStatsDto,
    recentActivities: ActivityData[],
    systemStatus: SystemStatusData
  ): AdminDashboardDto;

  /**
   * 사용자 목록 응답 생성
   */
  toUserListResponseDto(users: AdminUser[], total: number): UserListResponse;

  /**
   * 대량 작업 결과 생성
   */
  toBulkActionResponse(success: number, failed: number, errors: string[]): BulkActionResponse;

  /**
   * 관리자 활동 로그 생성
   */
  toActivityLog(admin: AdminUser, action: string, context: ActivityContext): ActivityLog;

  /**
   * 역할별 기본 권한 설정
   */
  getDefaultPermissions(role: AdminUserRole): string[];

  /**
   * 역할별 권한 레벨 확인
   */
  getRoleLevel(role: AdminUserRole): number;

  /**
   * 역할 권한 레벨 비교
   */
  hasHigherOrEqualLevel(role1: AdminUserRole, role2: AdminUserRole): boolean;

  /**
   * 역할이 시스템 관리자 권한을 가지는지 확인
   */
  isSystemAdmin(role: AdminUserRole): boolean;

  /**
   * 역할이 사용자 관리 권한을 가지는지 확인
   */
  canManageUsers(role: AdminUserRole): boolean;
}

/**
 * 통계 데이터
 */
export interface AdminStatsData {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  todayRegistrations: number;
  weeklyRegistrations: number;
  monthlyRegistrations: number;
  roleStats: Record<string, number>;
}

/**
 * 활동 데이터
 */
export interface ActivityData {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

/**
 * 시스템 상태 데이터
 */
export interface SystemStatusData {
  database: string;
  redis: string;
  api: string;
}

/**
 * 사용자 목록 응답
 */
export interface UserListResponse {
  users: UserSummary[];
  total: number;
}

/**
 * 사용자 요약 정보
 */
export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 대량 작업 응답
 */
export interface BulkActionResponse {
  success: number;
  failed: number;
  errors: string[];
}

/**
 * 활동 컨텍스트
 */
export interface ActivityContext {
  resourceId?: string;
  resourceType?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * 활동 로그
 */
export interface ActivityLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  resourceId?: string;
  resourceType?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}
