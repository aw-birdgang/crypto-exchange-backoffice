import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserManagementUseCaseImpl } from '../user-management.use-case';
import { UserService } from '../../services/user.service';
import { UserStatus, AdminUserRole, UserFilters } from '@crypto-exchange/shared';

// Mock UserService
const mockUserService = {
  getAllUsers: vi.fn(),
  getPendingUsers: vi.fn(),
  getUsersByStatus: vi.fn(),
  getUserById: vi.fn(),
  getUserStats: vi.fn(),
  searchUsers: vi.fn(),
  approveUser: vi.fn(),
  rejectUser: vi.fn(),
  updateUser: vi.fn(),
  changeUserRole: vi.fn(),
  updateUserStatus: vi.fn(),
  bulkUserAction: vi.fn(),
  deleteUser: vi.fn(),
} as unknown as UserService;

describe('UserManagementUseCaseImpl', () => {
  let useCase: UserManagementUseCaseImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new UserManagementUseCaseImpl(mockUserService);
  });

  describe('getAllUsers', () => {
    it('should validate and set default filters', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', firstName: 'John', lastName: 'Doe' },
        { id: '2', email: 'user2@test.com', firstName: 'Jane', lastName: 'Smith' },
      ];
      
      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await useCase.getAllUsers();

      expect(mockUserService.getAllUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      expect(result).toEqual(mockUsers);
    });

    it('should validate page number and set minimum to 1', async () => {
      const filters: UserFilters = { page: -1, limit: 10 };
      
      await useCase.getAllUsers(filters);

      expect(mockUserService.getAllUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    });

    it('should limit page size to maximum 100', async () => {
      const filters: UserFilters = { page: 1, limit: 150 };
      
      await useCase.getAllUsers(filters);

      expect(mockUserService.getAllUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 10, // 100을 초과하면 기본값 10으로 설정
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    });
  });

  describe('getUsersByStatus', () => {
    it('should validate user status and call service', async () => {
      const mockUsers = [{ id: '1', status: UserStatus.PENDING }];
      mockUserService.getUsersByStatus.mockResolvedValue(mockUsers);

      const result = await useCase.getUsersByStatus(UserStatus.PENDING);

      expect(mockUserService.getUsersByStatus).toHaveBeenCalledWith(UserStatus.PENDING);
      expect(result).toEqual(mockUsers);
    });

    it('should throw error for invalid status', async () => {
      await expect(useCase.getUsersByStatus('INVALID_STATUS' as UserStatus))
        .rejects.toThrow('Invalid user status: INVALID_STATUS');
    });
  });

  describe('searchUsers', () => {
    it('should validate search query minimum length', async () => {
      await expect(useCase.searchUsers('a'))
        .rejects.toThrow('Search query must be at least 2 characters long');
    });

    it('should validate search query is not empty', async () => {
      await expect(useCase.searchUsers(''))
        .rejects.toThrow('Search query must be at least 2 characters long');
    });

    it('should call service with valid query', async () => {
      const mockUsers = [{ id: '1', email: 'test@example.com' }];
      mockUserService.searchUsers.mockResolvedValue(mockUsers);

      const result = await useCase.searchUsers('test query');

      expect(mockUserService.searchUsers).toHaveBeenCalledWith('test query', undefined);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('approveUser', () => {
    it('should validate approval data and call service', async () => {
      const approvalData = {
        role: AdminUserRole.ADMIN,
        isActive: true,
      };
      const mockUser = { id: '1', status: UserStatus.APPROVED };
      mockUserService.approveUser.mockResolvedValue(mockUser);

      const result = await useCase.approveUser('1', approvalData);

      expect(mockUserService.approveUser).toHaveBeenCalledWith('1', approvalData);
      expect(result).toEqual(mockUser);
    });

    it('should throw error when role is missing', async () => {
      const approvalData = { isActive: true } as any;

      await expect(useCase.approveUser('1', approvalData))
        .rejects.toThrow('Role is required for user approval');
    });

    it('should throw error when isActive is not boolean', async () => {
      const approvalData = {
        role: AdminUserRole.ADMIN,
        isActive: 'true' as any,
      };

      await expect(useCase.approveUser('1', approvalData))
        .rejects.toThrow('isActive must be a boolean value');
    });
  });

  describe('suspendUser', () => {
    it('should validate suspension reason and call service', async () => {
      const mockUser = { id: '1', status: UserStatus.SUSPENDED };
      mockUserService.updateUser.mockResolvedValue(mockUser);

      const result = await useCase.suspendUser('1', 'Inappropriate behavior');

      expect(mockUserService.updateUser).toHaveBeenCalledWith('1', {
        status: UserStatus.SUSPENDED,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error for short suspension reason', async () => {
      await expect(useCase.suspendUser('1', 'Bad'))
        .rejects.toThrow('Suspension reason must be at least 5 characters long');
    });
  });

  describe('changeUserRole', () => {
    it('should validate role and call service', async () => {
      const mockUser = { id: '1', adminRole: AdminUserRole.ADMIN };
      mockUserService.changeUserRole.mockResolvedValue(mockUser);

      const result = await useCase.changeUserRole('1', AdminUserRole.ADMIN);

      expect(mockUserService.changeUserRole).toHaveBeenCalledWith('1', AdminUserRole.ADMIN);
      expect(result).toEqual(mockUser);
    });

    it('should throw error for invalid role', async () => {
      await expect(useCase.changeUserRole('1', 'INVALID_ROLE' as AdminUserRole))
        .rejects.toThrow('Invalid user role: INVALID_ROLE');
    });
  });

  describe('bulkUserAction', () => {
    it('should validate bulk action data and call service', async () => {
      const actionData = {
        action: 'APPROVE',
        userIds: ['1', '2', '3'],
      };
      const mockResult = { success: 3, failed: 0, errors: [] };
      mockUserService.bulkUserAction.mockResolvedValue(mockResult);

      const result = await useCase.bulkUserAction(actionData);

      expect(mockUserService.bulkUserAction).toHaveBeenCalledWith(actionData);
      expect(result).toEqual(mockResult);
    });

    it('should throw error when action is missing', async () => {
      const actionData = { userIds: ['1', '2'] } as any;

      await expect(useCase.bulkUserAction(actionData))
        .rejects.toThrow('Action is required for bulk operation');
    });

    it('should throw error when userIds is empty', async () => {
      const actionData = {
        action: 'APPROVE',
        userIds: [],
      };

      await expect(useCase.bulkUserAction(actionData))
        .rejects.toThrow('User IDs are required for bulk operation');
    });

    it('should throw error when too many users', async () => {
      const actionData = {
        action: 'APPROVE',
        userIds: Array(101).fill('1'), // 101개 사용자
      };

      await expect(useCase.bulkUserAction(actionData))
        .rejects.toThrow('Cannot process more than 100 users at once');
    });
  });
});
