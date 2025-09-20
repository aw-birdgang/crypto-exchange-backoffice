import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services/user.service';
import { 
  AdminUser, 
  UserStatus, 
  AdminUserRole, 
  UserApprovalRequest, 
  UserBulkAction, 
  UserStats, 
  UserFilters 
} from '@crypto-exchange/shared';

export const useUsers = (filters?: UserFilters) => {
  const userService = new UserService();
  
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getAllUsers(filters),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const usePendingUsers = () => {
  const userService = new UserService();
  
  return useQuery({
    queryKey: ['users', 'pending'],
    queryFn: () => userService.getPendingUsers(),
    staleTime: 2 * 60 * 1000, // 2분
    refetchInterval: 30 * 1000, // 30초마다 자동 새로고침
  });
};

export const useUsersByStatus = (status: UserStatus) => {
  const userService = new UserService();
  
  return useQuery({
    queryKey: ['users', 'status', status],
    queryFn: () => userService.getUsersByStatus(status),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserStats = () => {
  const userService = new UserService();
  
  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => userService.getUserStats(),
    staleTime: 10 * 60 * 1000, // 10분
  });
};

export const useUserApproval = () => {
  const queryClient = useQueryClient();
  const userService = new UserService();
  
  return useMutation({
    mutationFn: ({ userId, approvalData }: { userId: string; approvalData: UserApprovalRequest }) =>
      userService.approveUser(userId, approvalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
    },
  });
};

export const useUserRejection = () => {
  const queryClient = useQueryClient();
  const userService = new UserService();
  
  return useMutation({
    mutationFn: (userId: string) => userService.rejectUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
    },
  });
};

export const useUserUpdate = () => {
  const queryClient = useQueryClient();
  const userService = new UserService();
  
  return useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: Partial<AdminUser> }) =>
      userService.updateUser(userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUserDelete = () => {
  const queryClient = useQueryClient();
  const userService = new UserService();
  
  return useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
    },
  });
};

export const useBulkUserAction = () => {
  const queryClient = useQueryClient();
  const userService = new UserService();
  
  return useMutation({
    mutationFn: (actionData: UserBulkAction) => userService.bulkUserAction(actionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
    },
  });
};

export const useUserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});
  
  const userService = new UserService();
  
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['users', 'search', searchQuery, filters],
    queryFn: () => userService.searchUsers(searchQuery, filters),
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
