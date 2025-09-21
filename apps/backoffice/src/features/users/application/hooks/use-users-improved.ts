import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UseCaseFactory } from '../use-cases/use-case.factory';
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

// Use Case 초기화 (앱 시작 시 한 번만 실행)
const initializeUseCases = () => {
  const userService = new AdminUserService();
  UseCaseFactory.initialize(userService);
};

// 앱 시작 시 Use Case 초기화
if (typeof window !== 'undefined') {
  initializeUseCases();
}

/**
 * 개선된 사용자 관리 Hooks
 * Clean Architecture의 Use Case 계층을 사용
 */
export const useUsers = (filters?: UserFilters) => {
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userManagementUseCase.getAllUsers(filters),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const usePendingUsers = () => {
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useQuery({
    queryKey: ['users', 'pending'],
    queryFn: () => userManagementUseCase.getPendingUsers(),
    staleTime: 2 * 60 * 1000, // 2분
    refetchInterval: 30 * 1000, // 30초마다 자동 새로고침
  });
};

export const useUsersByStatus = (status: UserStatus) => {
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useQuery({
    queryKey: ['users', 'status', status],
    queryFn: () => userManagementUseCase.getUsersByStatus(status),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserStats = () => {
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => userManagementUseCase.getUserStats(),
    staleTime: 10 * 60 * 1000, // 10분
  });
};

export const useUserApproval = () => {
  const queryClient = useQueryClient();
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useMutation({
    mutationFn: ({ userId, approvalData }: { userId: string; approvalData: UserApprovalRequest }) =>
      userManagementUseCase.approveUser(userId, approvalData),
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
    mutationFn: (userId: string) => userManagementUseCase.rejectUser(userId),
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
    mutationFn: ({ userId, userData }: { userId: string; userData: Partial<AdminUser> }) =>
      userManagementUseCase.updateUser(userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUserDelete = () => {
  const queryClient = useQueryClient();
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useMutation({
    mutationFn: (userId: string) => userManagementUseCase.deleteUser(userId),
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
    mutationFn: (actionData: UserBulkAction) => userManagementUseCase.bulkUserAction(actionData),
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
    queryFn: () => userManagementUseCase.searchUsers(searchQuery, filters),
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
    return await userValidationUseCase.validateUserData(userData);
  }, [userValidationUseCase]);

  const validateBulkAction = useCallback(async (actionData: UserBulkAction) => {
    return await userValidationUseCase.validateBulkAction(actionData);
  }, [userValidationUseCase]);

  const canApproveUser = useCallback(async (userId: string) => {
    return await userValidationUseCase.canApproveUser(userId);
  }, [userValidationUseCase]);

  const canDeleteUser = useCallback(async (userId: string) => {
    return await userValidationUseCase.canDeleteUser(userId);
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
    queryFn: () => userAnalyticsUseCase.getUserCountsByStatus(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: userCountsByRole, isLoading: roleLoading } = useQuery({
    queryKey: ['users', 'analytics', 'role-counts'],
    queryFn: () => userAnalyticsUseCase.getUserCountsByRole(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: pendingUsersCount, isLoading: pendingLoading } = useQuery({
    queryKey: ['users', 'analytics', 'pending-count'],
    queryFn: () => userAnalyticsUseCase.getPendingUsersCount(),
    staleTime: 2 * 60 * 1000,
  });

  const getUserActivityStats = useCallback(async (userId: string) => {
    return await userAnalyticsUseCase.getUserActivityStats(userId);
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
