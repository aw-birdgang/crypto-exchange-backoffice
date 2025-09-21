import { AdminUser, UserFilters, UserStatus, AdminUserRole, UserApprovalRequest, UserBulkAction, UserStats } from '@crypto-exchange/shared';

/**
 * 어드민 사용자 관리 Use Case 인터페이스
 * Clean Architecture의 Use Case 계층을 정의
 */
export interface AdminUserManagementUseCase {
  // 조회 Use Cases
  getAllUsers(filters?: UserFilters): Promise<AdminUser[]>;
  getPendingUsers(): Promise<AdminUser[]>;
  getUsersByStatus(status: UserStatus): Promise<AdminUser[]>;
  getUserById(userId: string): Promise<AdminUser>;
  getUserStats(): Promise<UserStats>;
  searchUsers(query: string, filters?: Omit<UserFilters, 'search'>): Promise<AdminUser[]>;
  
  // 사용자 상태 관리 Use Cases
  approveUser(userId: string, approvalData: UserApprovalRequest): Promise<AdminUser>;
  rejectUser(userId: string): Promise<AdminUser>;
  suspendUser(userId: string, reason: string): Promise<AdminUser>;
  activateUser(userId: string): Promise<AdminUser>;
  
  // 사용자 정보 관리 Use Cases
  updateUser(userId: string, userData: Partial<AdminUser>): Promise<AdminUser>;
  changeUserRole(userId: string, role: AdminUserRole): Promise<AdminUser>;
  updateUserStatus(userId: string, status: UserStatus): Promise<AdminUser>;
  
  // 대량 작업 Use Cases
  bulkUserAction(actionData: UserBulkAction): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }>;
  
  // 사용자 삭제 Use Case
  deleteUser(userId: string): Promise<void>;
}

/**
 * 어드민 사용자 검증 Use Case 인터페이스
 */
export interface AdminUserValidationUseCase {
  validateUserData(userData: Partial<AdminUser>): Promise<{ isValid: boolean; errors: string[] }>;
  validateBulkAction(actionData: UserBulkAction): Promise<{ isValid: boolean; errors: string[] }>;
  canApproveUser(userId: string): Promise<boolean>;
  canDeleteUser(userId: string): Promise<boolean>;
}

/**
 * 어드민 사용자 통계 Use Case 인터페이스
 */
export interface AdminUserAnalyticsUseCase {
  getUserCountsByStatus(): Promise<Record<UserStatus, number>>;
  getUserCountsByRole(): Promise<Record<AdminUserRole, number>>;
  getPendingUsersCount(): Promise<number>;
  getUserActivityStats(userId: string): Promise<{
    lastLogin: Date | null;
    loginCount: number;
    isActive: boolean;
  }>;
}
