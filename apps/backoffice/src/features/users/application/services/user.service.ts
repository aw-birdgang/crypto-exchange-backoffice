import {ApiService} from '@/shared/services/api.service';
import {ApiPathBuilder} from '@/shared/utils/api-path-builder';
import {
  AdminUser,
  AdminUserRole,
  UserApprovalRequest,
  UserBulkAction,
  UserFilters,
  UserStats,
  UserStatus,
  API_ROUTES
} from '@crypto-exchange/shared';

export class AdminUserService {
  private apiService: ApiService;

  constructor(apiService?: ApiService) {
    this.apiService = apiService || new ApiService();
  }

  /**
   * 모든 사용자 목록 조회
   */
  async getAllUsers(filters?: UserFilters): Promise<AdminUser[]> {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await this.apiService.get<{ adminUsers: AdminUser[]; total: number; page: number; limit: number }>(
      ApiPathBuilder.buildWithParams(API_ROUTES.ADMIN.ADMINS, Object.fromEntries(params.entries()))
    );
    
    console.log('🔍 AdminUserService.getAllUsers - API Response:', response);
    console.log('🔍 AdminUserService.getAllUsers - AdminUsers count:', response.adminUsers?.length || 0);
    
    // API 응답에서 adminUsers 배열만 반환
    return response.adminUsers || [];
  }

  /**
   * 대기 중인 사용자 목록 조회
   */
  async getPendingUsers(): Promise<AdminUser[]> {
    return await this.apiService.get<AdminUser[]>(ApiPathBuilder.admin('USERS') + '/pending');
  }

  /**
   * 상태별 사용자 목록 조회
   */
  async getUsersByStatus(status: UserStatus): Promise<AdminUser[]> {
    return await this.apiService.get<AdminUser[]>(ApiPathBuilder.buildWithVariables('/admin/users/status/:status', { status }));
  }

  /**
   * 사용자 승인
   */
  async approveUser(userId: string, approvalData: UserApprovalRequest): Promise<AdminUser> {
    return await this.apiService.put<AdminUser>(ApiPathBuilder.buildWithVariables('/admin/users/:userId/approve', { userId }), approvalData);
  }

  /**
   * 사용자 거부
   */
  async rejectUser(userId: string): Promise<AdminUser> {
    return await this.apiService.put<AdminUser>(ApiPathBuilder.buildWithVariables('/admin/users/:userId/reject', { userId }));
  }

  /**
   * 사용자 정보 수정
   */
  async updateUser(userId: string, userData: Partial<AdminUser>): Promise<AdminUser> {
    // role 필드를 adminRole로 매핑
    const mappedData = { ...userData };
    if ('role' in mappedData && mappedData.role) {
      mappedData.adminRole = mappedData.role as AdminUserRole;
      delete mappedData.role;
    }
    
    return await this.apiService.put<AdminUser>(ApiPathBuilder.buildWithVariables('/admin/users/:userId', { userId }), mappedData);
  }

  /**
   * 사용자 삭제
   */
  async deleteUser(userId: string): Promise<void> {
    await this.apiService.delete(ApiPathBuilder.buildWithVariables('/admin/users/:userId', { userId }));
  }

  /**
   * 대량 사용자 작업
   */
  async bulkUserAction(actionData: UserBulkAction): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    return await this.apiService.post<{
      success: number;
      failed: number;
      errors: string[];
    }>(ApiPathBuilder.admin('USERS') + '/bulk-action', actionData);
  }

  /**
   * 사용자 통계 조회
   */
  async getUserStats(): Promise<UserStats> {
    try {
      // 기본 통계 조회
      const response = await this.apiService.get<{
        totalUsers: number;
        activeUsers: number;
        adminCount: number;
        todayRegistrations: number;
        weeklyRegistrations: number;
        monthlyRegistrations: number;
        roleStats: Record<string, number>;
      }>(ApiPathBuilder.admin('STATS'));
      
      // 상태별 사용자 수를 실제로 조회
      const [pendingUsers, approvedUsers, rejectedUsers, suspendedUsers] = await Promise.all([
        this.getUsersByStatus(UserStatus.PENDING),
        this.getUsersByStatus(UserStatus.APPROVED),
        this.getUsersByStatus(UserStatus.REJECTED),
        this.getUsersByStatus(UserStatus.SUSPENDED),
      ]);
      
      // API 응답을 UserStats 형태로 매핑
      const stats = {
        totalUsers: response.totalUsers || 0, // API에서 반환하는 totalUsers 사용
        activeUsers: response.activeUsers || 0, // API에서 계산된 활성 관리자 수 사용
        pendingUsers: pendingUsers.length,
        approvedUsers: approvedUsers.length,
        rejectedUsers: rejectedUsers.length,
        suspendedUsers: suspendedUsers.length,
        todayRegistrations: response.todayRegistrations || 0,
        weeklyRegistrations: response.weeklyRegistrations || 0,
        monthlyRegistrations: response.monthlyRegistrations || 0,
        roleStats: response.roleStats || {},
      };
      
      console.log('🔍 AdminUserService.getUserStats - Mapped stats:', stats);
      return stats;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      // 에러 시 기본값 반환
      return {
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        approvedUsers: 0,
        rejectedUsers: 0,
        suspendedUsers: 0,
        todayRegistrations: 0,
        weeklyRegistrations: 0,
        monthlyRegistrations: 0,
        roleStats: {},
      };
    }
  }

  /**
   * 사용자 상세 정보 조회
   */
  async getUserById(userId: string): Promise<AdminUser> {
    return await this.apiService.get<AdminUser>(ApiPathBuilder.buildWithVariables('/admin/admins/:userId', { userId }));
  }

  /**
   * 사용자 검색
   */
  async searchUsers(query: string, filters?: Omit<UserFilters, 'search'>): Promise<AdminUser[]> {
    return this.getAllUsers({ ...filters, search: query });
  }

  /**
   * 사용자 상태 업데이트
   */
  async updateUserStatus(userId: string, status: UserStatus): Promise<AdminUser> {
    const updateData = { status };
    return this.updateUser(userId, updateData);
  }

  /**
   * 사용자 활성화/비활성화
   */
  async toggleUserActive(userId: string, isActive: boolean): Promise<AdminUser> {
    const updateData = { isActive };
    return this.updateUser(userId, updateData);
  }

  /**
   * 사용자 활성화 (API 직접 호출)
   */
  async activateUser(userId: string): Promise<AdminUser> {
    return await this.apiService.put<AdminUser>(`/admin/users/${userId}/activate`);
  }

  /**
   * 사용자 비활성화 (API 직접 호출)
   */
  async deactivateUser(userId: string): Promise<AdminUser> {
    return await this.apiService.put<AdminUser>(`/admin/users/${userId}/deactivate`);
  }

  /**
   * 사용자 정지 (API 직접 호출)
   */
  async suspendUser(userId: string, reason: string): Promise<AdminUser> {
    return await this.apiService.put<AdminUser>(`/admin/users/${userId}/suspend`, { reason });
  }

  /**
   * 사용자 정지 해제 (API 직접 호출)
   */
  async unsuspendUser(userId: string): Promise<AdminUser> {
    return await this.apiService.put<AdminUser>(`/admin/users/${userId}/unsuspend`);
  }

  /**
   * 사용자 역할 변경
   */
  async changeUserRole(userId: string, role: AdminUserRole): Promise<AdminUser> {
    const updateData = { adminRole: role };
    return this.updateUser(userId, updateData);
  }

  /**
   * 승인 대기 중인 사용자 수 조회
   */
  async getPendingUsersCount(): Promise<number> {
    const users = await this.getPendingUsers();
    return users.length;
  }

  /**
   * 상태별 사용자 수 조회
   */
  async getUsersCountByStatus(): Promise<Record<UserStatus, number>> {
    const [pending, approved, rejected, suspended] = await Promise.all([
      this.getUsersByStatus(UserStatus.PENDING),
      this.getUsersByStatus(UserStatus.APPROVED),
      this.getUsersByStatus(UserStatus.REJECTED),
      this.getUsersByStatus(UserStatus.SUSPENDED),
    ]);

    return {
      [UserStatus.PENDING]: pending.length,
      [UserStatus.APPROVED]: approved.length,
      [UserStatus.REJECTED]: rejected.length,
      [UserStatus.SUSPENDED]: suspended.length,
    };
  }
}
