import { 
  AdminUserManagementUseCase, 
  AdminUserValidationUseCase, 
  AdminUserAnalyticsUseCase 
} from '../../domain/use-cases/user-management.use-case.interface';
import { AdminUserService } from '../services/user.service';
import { 
  AdminUser, 
  UserFilters, 
  UserStatus, 
  AdminUserRole, 
  UserApprovalRequest, 
  UserBulkAction, 
  UserStats 
} from '@crypto-exchange/shared';

/**
 * 어드민 사용자 관리 Use Case 구현체
 * 비즈니스 로직을 캡슐화하고 도메인 규칙을 적용
 */
export class AdminUserManagementUseCaseImpl implements AdminUserManagementUseCase {
  constructor(private readonly adminUserService: AdminUserService) {}

  async getAllUsers(filters?: UserFilters): Promise<AdminUser[]> {
    // 비즈니스 로직: 필터 검증 및 기본값 설정
    const validatedFilters = this.validateFilters(filters);
    return await this.adminUserService.getAllUsers(validatedFilters);
  }

  async getPendingUsers(): Promise<AdminUser[]> {
    return await this.adminUserService.getPendingUsers();
  }

  async getUsersByStatus(status: UserStatus): Promise<AdminUser[]> {
    // 비즈니스 로직: 상태 검증
    if (!Object.values(UserStatus).includes(status)) {
      throw new Error(`Invalid user status: ${status}`);
    }
    return await this.adminUserService.getUsersByStatus(status);
  }

  async getUserById(userId: string): Promise<AdminUser> {
    // 비즈니스 로직: ID 검증
    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required');
    }
    return await this.adminUserService.getUserById(userId);
  }

  async getUserStats(): Promise<UserStats> {
    return await this.adminUserService.getUserStats();
  }

  async searchUsers(query: string, filters?: Omit<UserFilters, 'search'>): Promise<AdminUser[]> {
    // 비즈니스 로직: 검색 쿼리 검증
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }
    return await this.adminUserService.searchUsers(query, filters);
  }

  async approveUser(userId: string, approvalData: UserApprovalRequest): Promise<AdminUser> {
    // 비즈니스 로직: 승인 데이터 검증
    this.validateApprovalData(approvalData);
    return await this.adminUserService.approveUser(userId, approvalData);
  }

  async rejectUser(userId: string): Promise<AdminUser> {
    return await this.adminUserService.rejectUser(userId);
  }

  async suspendUser(userId: string, reason: string): Promise<AdminUser> {
    // 비즈니스 로직: 정지 사유 검증
    if (!reason || reason.trim().length < 5) {
      throw new Error('Suspension reason must be at least 5 characters long');
    }
    return await this.adminUserService.updateUser(userId, { 
      status: UserStatus.SUSPENDED,
      // 실제로는 별도 필드에 reason 저장
    });
  }

  async activateUser(userId: string): Promise<AdminUser> {
    return await this.adminUserService.updateUser(userId, { 
      status: UserStatus.APPROVED,
      isActive: true 
    });
  }

  async updateUser(userId: string, userData: Partial<AdminUser>): Promise<AdminUser> {
    // 비즈니스 로직: 업데이트 데이터 검증
    this.validateUserUpdateData(userData);
    return await this.adminUserService.updateUser(userId, userData);
  }

  async changeUserRole(userId: string, role: AdminUserRole): Promise<AdminUser> {
    // 비즈니스 로직: 역할 변경 검증
    if (!Object.values(AdminUserRole).includes(role)) {
      throw new Error(`Invalid user role: ${role}`);
    }
    return await this.adminUserService.changeUserRole(userId, role);
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<AdminUser> {
    return await this.adminUserService.updateUserStatus(userId, status);
  }

  async bulkUserAction(actionData: UserBulkAction): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    // 비즈니스 로직: 대량 작업 검증
    this.validateBulkActionData(actionData);
    return await this.adminUserService.bulkUserAction(actionData);
  }

  async deleteUser(userId: string): Promise<void> {
    // 비즈니스 로직: 삭제 권한 검증 (실제 구현에서는 권한 체크)
    await this.adminUserService.deleteUser(userId);
  }

  // Private helper methods for business logic
  private validateFilters(filters?: UserFilters): UserFilters {
    const defaultFilters: UserFilters = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    if (!filters) return defaultFilters;

    // 페이지 번호 검증
    if (filters.page && filters.page < 1) {
      filters.page = 1;
    }

    // 페이지 크기 제한
    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
      filters.limit = 10;
    }

    return { ...defaultFilters, ...filters };
  }

  private validateApprovalData(approvalData: UserApprovalRequest): void {
    if (!approvalData.role) {
      throw new Error('Role is required for user approval');
    }
    if (typeof approvalData.isActive !== 'boolean') {
      throw new Error('isActive must be a boolean value');
    }
  }

  private validateUserUpdateData(userData: Partial<AdminUser>): void {
    // 이메일 형식 검증
    if (userData.email && !this.isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }
    
    // 이름 길이 검증
    if (userData.firstName && userData.firstName.length < 2) {
      throw new Error('First name must be at least 2 characters long');
    }
    
    if (userData.lastName && userData.lastName.length < 2) {
      throw new Error('Last name must be at least 2 characters long');
    }
  }

  private validateBulkActionData(actionData: UserBulkAction): void {
    if (!actionData.action) {
      throw new Error('Action is required for bulk operation');
    }
    if (!actionData.userIds || actionData.userIds.length === 0) {
      throw new Error('User IDs are required for bulk operation');
    }
    if (actionData.userIds.length > 100) {
      throw new Error('Cannot process more than 100 users at once');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * 어드민 사용자 검증 Use Case 구현체
 */
export class AdminUserValidationUseCaseImpl implements AdminUserValidationUseCase {
  constructor(private readonly adminUserService: AdminUserService) {}

  async validateUserData(userData: Partial<AdminUser>): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (userData.email && !this.isValidEmail(userData.email)) {
      errors.push('Invalid email format');
    }

    if (userData.firstName && userData.firstName.length < 2) {
      errors.push('First name must be at least 2 characters long');
    }

    if (userData.lastName && userData.lastName.length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async validateBulkAction(actionData: UserBulkAction): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!actionData.action) {
      errors.push('Action is required');
    }

    if (!actionData.userIds || actionData.userIds.length === 0) {
      errors.push('User IDs are required');
    }

    if (actionData.userIds && actionData.userIds.length > 100) {
      errors.push('Cannot process more than 100 users at once');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async canApproveUser(userId: string): Promise<boolean> {
    try {
      const user = await this.adminUserService.getUserById(userId);
      return user.status === UserStatus.PENDING;
    } catch {
      return false;
    }
  }

  async canDeleteUser(userId: string): Promise<boolean> {
    try {
      const user = await this.adminUserService.getUserById(userId);
      // 비즈니스 규칙: 활성 사용자는 삭제할 수 없음
      return !user.isActive;
    } catch {
      return false;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * 어드민 사용자 분석 Use Case 구현체
 */
export class AdminUserAnalyticsUseCaseImpl implements AdminUserAnalyticsUseCase {
  constructor(private readonly adminUserService: AdminUserService) {}

  async getUserCountsByStatus(): Promise<Record<UserStatus, number>> {
    return await this.adminUserService.getUsersCountByStatus();
  }

  async getUserCountsByRole(): Promise<Record<AdminUserRole, number>> {
    const users = await this.adminUserService.getAllUsers();
    const counts = {} as Record<AdminUserRole, number>;
    
    // 초기화
    Object.values(AdminUserRole).forEach(role => {
      counts[role] = 0;
    });

    // 카운트
    users.forEach(user => {
      if (user.adminRole) {
        counts[user.adminRole]++;
      }
    });

    return counts;
  }

  async getPendingUsersCount(): Promise<number> {
    return await this.adminUserService.getPendingUsersCount();
  }

  async getUserActivityStats(userId: string): Promise<{
    lastLogin: Date | null;
    loginCount: number;
    isActive: boolean;
  }> {
    const user = await this.adminUserService.getUserById(userId);
    
    return {
      lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
      loginCount: (user as any).loginCount || 0, // 타입 캐스팅으로 임시 처리
      isActive: user.isActive,
    };
  }
}
