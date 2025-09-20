import {ApiService} from '@/shared/services/api.service';
import {
  AdminUser,
  AdminUserRole,
  UserApprovalRequest,
  UserBulkAction,
  UserFilters,
  UserStats,
  UserStatus
} from '@crypto-exchange/shared';

export class UserService {
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

    return await this.apiService.get<AdminUser[]>(`/admin/admins?${params.toString()}`);
  }

  /**
   * 대기 중인 사용자 목록 조회
   */
  async getPendingUsers(): Promise<AdminUser[]> {
    return await this.apiService.get<AdminUser[]>('/admin/users/pending');
  }

  /**
   * 상태별 사용자 목록 조회
   */
  async getUsersByStatus(status: UserStatus): Promise<AdminUser[]> {
    return await this.apiService.get<AdminUser[]>(`/admin/users/status/${status}`);
  }

  /**
   * 사용자 승인
   */
  async approveUser(userId: string, approvalData: UserApprovalRequest): Promise<AdminUser> {
    return await this.apiService.put<AdminUser>(`/admin/users/${userId}/approve`, approvalData);
  }

  /**
   * 사용자 거부
   */
  async rejectUser(userId: string): Promise<AdminUser> {
    return await this.apiService.put<AdminUser>(`/admin/users/${userId}/reject`);
  }

  /**
   * 사용자 정보 수정
   */
  async updateUser(userId: string, userData: Partial<AdminUser>): Promise<AdminUser> {
    return await this.apiService.put<AdminUser>(`/admin/users/${userId}`, userData);
  }

  /**
   * 사용자 삭제
   */
  async deleteUser(userId: string): Promise<void> {
    await this.apiService.delete(`/admin/users/${userId}`);
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
    }>('/admin/users/bulk-action', actionData);
  }

  /**
   * 사용자 통계 조회
   */
  async getUserStats(): Promise<UserStats> {
    return await this.apiService.get<UserStats>('/admin/stats');
  }

  /**
   * 사용자 상세 정보 조회
   */
  async getUserById(userId: string): Promise<AdminUser> {
    return await this.apiService.get<AdminUser>(`/admin/admins/${userId}`);
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
