import {useCallback, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AdminUserService} from '../services/user.service';
import {AdminUser, UserApprovalRequest, UserBulkAction, UserFilters, UserStatus} from '@crypto-exchange/shared';

export const useAdminUsers = (filters?: UserFilters) => {
  const adminUserService = new AdminUserService();

  return useQuery({
    queryKey: ['adminUsers', filters],
    queryFn: () => adminUserService.getAllUsers(filters),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const usePendingAdminUsers = () => {
  const adminUserService = new AdminUserService();

  return useQuery({
    queryKey: ['adminUsers', 'pending'],
    queryFn: () => adminUserService.getPendingUsers(),
    staleTime: 2 * 60 * 1000, // 2분
    refetchInterval: 30 * 1000, // 30초마다 자동 새로고침
  });
};

export const useAdminUsersByStatus = (status: UserStatus) => {
  const adminUserService = new AdminUserService();

  return useQuery({
    queryKey: ['adminUsers', 'status', status],
    queryFn: () => adminUserService.getUsersByStatus(status),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminUserStats = () => {
  const adminUserService = new AdminUserService();

  return useQuery({
    queryKey: ['adminUsers', 'stats'],
    queryFn: () => adminUserService.getUserStats(),
    staleTime: 10 * 60 * 1000, // 10분
  });
};

export const useAdminUserApproval = () => {
  const queryClient = useQueryClient();
  const adminUserService = new AdminUserService();

  return useMutation({
    mutationFn: ({ adminUserId, approvalData }: { adminUserId: string; approvalData: UserApprovalRequest }) =>
      adminUserService.approveUser(adminUserId, approvalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers', 'stats'] });
    },
  });
};

export const useAdminUserRejection = () => {
  const queryClient = useQueryClient();
  const adminUserService = new AdminUserService();

  return useMutation({
    mutationFn: (adminUserId: string) => adminUserService.rejectUser(adminUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers', 'stats'] });
    },
  });
};

export const useAdminUserUpdate = () => {
  const queryClient = useQueryClient();
  const adminUserService = new AdminUserService();

  return useMutation({
    mutationFn: ({ adminUserId, adminUserData }: { adminUserId: string; adminUserData: Partial<AdminUser> }) =>
      adminUserService.updateUser(adminUserId, adminUserData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};

export const useAdminUserDelete = () => {
  const queryClient = useQueryClient();
  const adminUserService = new AdminUserService();

  return useMutation({
    mutationFn: (adminUserId: string) => adminUserService.deleteUser(adminUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers', 'stats'] });
    },
  });
};

export const useBulkAdminUserAction = () => {
  const queryClient = useQueryClient();
  const adminUserService = new AdminUserService();

  return useMutation({
    mutationFn: (actionData: UserBulkAction) => adminUserService.bulkUserAction(actionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers', 'stats'] });
    },
  });
};

export const useAdminUserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});

  const adminUserService = new AdminUserService();

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['adminUsers', 'search', searchQuery, filters],
    queryFn: () => adminUserService.searchUsers(searchQuery, filters),
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

export const useAdminUserFilters = () => {
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
