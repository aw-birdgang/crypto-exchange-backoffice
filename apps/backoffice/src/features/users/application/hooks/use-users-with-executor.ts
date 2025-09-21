import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UseCaseFactory } from '../use-cases/use-case.factory';
import { UseCaseExecutorFactory, UseCaseExecutor } from '@/shared/application/use-cases/use-case.executor';
import { AdminUserService } from '../services/user.service';
import { 
  AdminUser, 
  UserStatus, 
  AdminUserRole, 
  UserApprovalRequest, 
  UserBulkAction, 
  UserStats, 
  UserFilters 
} from '@crypto-exchange/shared';
import { UseCaseContext } from '@/shared/domain/use-cases/base.use-case.interface';

// Use Case 실행기 초기화
const useCaseExecutor: UseCaseExecutor = UseCaseExecutorFactory.createDefault();

// Use Case 초기화 (앱 시작 시 한 번만 실행)
const initializeUseCases = () => {
  const userService = new AdminUserService();
  UseCaseFactory.initialize(userService);
};

if (typeof window !== 'undefined') {
  initializeUseCases();
}

/**
 * Use Case Context 생성 헬퍼
 */
const createUseCaseContext = (useCaseName: string, params?: any): UseCaseContext => ({
  requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  timestamp: new Date(),
  metadata: {
    useCaseName,
    params,
  },
});

/**
 * Use Case 실행 헬퍼
 */
const executeUseCase = async <T>(
  useCaseName: string,
  useCaseFn: (context: UseCaseContext) => Promise<T>,
  params?: any
): Promise<T> => {
  const context = createUseCaseContext(useCaseName, params);
  const result = await useCaseExecutor.execute<T, T>(useCaseFn, context);
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Use case execution failed');
  }
  
  return result.data!;
};

/**
 * 개선된 사용자 관리 Hooks (Use Case Executor 사용)
 */
export const useUsers = (filters?: UserFilters) => {
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => executeUseCase(
      'getAllUsers',
      () => userManagementUseCase.getAllUsers(filters),
      { filters }
    ),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const usePendingUsers = () => {
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useQuery({
    queryKey: ['users', 'pending'],
    queryFn: () => executeUseCase(
      'getPendingUsers',
      () => userManagementUseCase.getPendingUsers()
    ),
    staleTime: 2 * 60 * 1000, // 2분
    refetchInterval: 30 * 1000, // 30초마다 자동 새로고침
  });
};

export const useUsersByStatus = (status: UserStatus) => {
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useQuery({
    queryKey: ['users', 'status', status],
    queryFn: () => executeUseCase(
      'getUsersByStatus',
      () => userManagementUseCase.getUsersByStatus(status),
      { status }
    ),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserStats = () => {
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => executeUseCase(
      'getUserStats',
      () => userManagementUseCase.getUserStats()
    ),
    staleTime: 10 * 60 * 1000, // 10분
  });
};

export const useUserApproval = () => {
  const queryClient = useQueryClient();
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useMutation({
    mutationFn: async ({ userId, approvalData }: { userId: string; approvalData: UserApprovalRequest }) => {
      return executeUseCase(
        'approveUser',
        () => userManagementUseCase.approveUser(userId, approvalData),
        { userId, approvalData }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
    },
  });
};

export const useUserRejection = () => {
  const queryClient = useQueryClient();
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      return executeUseCase(
        'rejectUser',
        () => userManagementUseCase.rejectUser(userId),
        { userId }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
    },
  });
};

export const useUserUpdate = () => {
  const queryClient = useQueryClient();
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: Partial<AdminUser> }) => {
      return executeUseCase(
        'updateUser',
        () => userManagementUseCase.updateUser(userId, userData),
        { userId, userData }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUserDelete = () => {
  const queryClient = useQueryClient();
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      return executeUseCase(
        'deleteUser',
        () => userManagementUseCase.deleteUser(userId),
        { userId }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
    },
  });
};

export const useBulkUserAction = () => {
  const queryClient = useQueryClient();
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useMutation({
    mutationFn: async (actionData: UserBulkAction) => {
      return executeUseCase(
        'bulkUserAction',
        () => userManagementUseCase.bulkUserAction(actionData),
        { actionData }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
    },
  });
};

export const useUserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});
  
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['users', 'search', searchQuery, filters],
    queryFn: () => executeUseCase(
      'searchUsers',
      () => userManagementUseCase.searchUsers(searchQuery, filters),
      { searchQuery, filters }
    ),
    enabled: searchQuery.length > 0,
    staleTime: 2 * 60 * 1000,
  });

  const search = useCallback((query: string, searchFilters?: UserFilters) => {
    setSearchQuery(query);
    if (searchFilters) {
      setFilters(searchFilters);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setFilters({});
  }, []);

  return {
    searchResults,
    isLoading,
    error,
    search,
    clearSearch,
    searchQuery,
    filters,
  };
};

/**
 * 사용자 검증 관련 Hooks
 */
export const useUserValidation = () => {
  const userValidationUseCase = UseCaseFactory.getAdminUserValidationUseCase();
  
  const validateUserData = useCallback(async (userData: Partial<AdminUser>) => {
    return await executeUseCase(
      'validateUserData',
      () => userValidationUseCase.validateUserData(userData),
      { userData }
    );
  }, [userValidationUseCase]);

  const validateBulkAction = useCallback(async (actionData: UserBulkAction) => {
    return await executeUseCase(
      'validateBulkAction',
      () => userValidationUseCase.validateBulkAction(actionData),
      { actionData }
    );
  }, [userValidationUseCase]);

  const canApproveUser = useCallback(async (userId: string) => {
    return await executeUseCase(
      'canApproveUser',
      () => userValidationUseCase.canApproveUser(userId),
      { userId }
    );
  }, [userValidationUseCase]);

  const canDeleteUser = useCallback(async (userId: string) => {
    return await executeUseCase(
      'canDeleteUser',
      () => userValidationUseCase.canDeleteUser(userId),
      { userId }
    );
  }, [userValidationUseCase]);

  return {
    validateUserData,
    validateBulkAction,
    canApproveUser,
    canDeleteUser,
  };
};

/**
 * 사용자 분석 관련 Hooks
 */
export const useUserAnalytics = () => {
  const userAnalyticsUseCase = UseCaseFactory.getAdminUserAnalyticsUseCase();
  
  const { data: userCountsByStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['users', 'analytics', 'status-counts'],
    queryFn: () => executeUseCase(
      'getUserCountsByStatus',
      () => userAnalyticsUseCase.getUserCountsByStatus()
    ),
    staleTime: 10 * 60 * 1000,
  });

  const { data: userCountsByRole, isLoading: roleLoading } = useQuery({
    queryKey: ['users', 'analytics', 'role-counts'],
    queryFn: () => executeUseCase(
      'getUserCountsByRole',
      () => userAnalyticsUseCase.getUserCountsByRole()
    ),
    staleTime: 10 * 60 * 1000,
  });

  const { data: pendingUsersCount, isLoading: pendingLoading } = useQuery({
    queryKey: ['users', 'analytics', 'pending-count'],
    queryFn: () => executeUseCase(
      'getPendingUsersCount',
      () => userAnalyticsUseCase.getPendingUsersCount()
    ),
    staleTime: 2 * 60 * 1000,
  });

  const getUserActivityStats = useCallback(async (userId: string) => {
    return await executeUseCase(
      'getUserActivityStats',
      () => userAnalyticsUseCase.getUserActivityStats(userId),
      { userId }
    );
  }, [userAnalyticsUseCase]);

  return {
    userCountsByStatus,
    userCountsByRole,
    pendingUsersCount,
    getUserActivityStats,
    isLoading: statusLoading || roleLoading || pendingLoading,
  };
};

export const useUserFilters = () => {
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const updateFilter = useCallback((filters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...filters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }, []);

  const clearFilter = useCallback((key: keyof UserFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
    clearFilter,
  };
};
