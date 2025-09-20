import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AdminUser, UserStatus, AdminUserRole, UserFilters } from '@crypto-exchange/shared';

interface UserState {
  // 상태
  users: AdminUser[];
  selectedUsers: string[];
  filters: UserFilters;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  
  // 액션
  setUsers: (users: AdminUser[]) => void;
  addUser: (user: AdminUser) => void;
  updateUser: (userId: string, userData: Partial<AdminUser>) => void;
  removeUser: (userId: string) => void;
  setSelectedUsers: (userIds: string[]) => void;
  toggleUserSelection: (userId: string) => void;
  clearSelection: () => void;
  setFilters: (filters: Partial<UserFilters>) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  users: [],
  selectedUsers: [],
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  },
  searchQuery: '',
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setUsers: (users) => set({ users }, false, 'setUsers'),

      addUser: (user) => set(
        (state) => ({ users: [...state.users, user] }),
        false,
        'addUser'
      ),

      updateUser: (userId, userData) => set(
        (state) => ({
          users: state.users.map(user =>
            user.id === userId ? { ...user, ...userData } : user
          ),
        }),
        false,
        'updateUser'
      ),

      removeUser: (userId) => set(
        (state) => ({
          users: state.users.filter(user => user.id !== userId),
          selectedUsers: state.selectedUsers.filter(id => id !== userId),
        }),
        false,
        'removeUser'
      ),

      setSelectedUsers: (userIds) => set(
        { selectedUsers: userIds },
        false,
        'setSelectedUsers'
      ),

      toggleUserSelection: (userId) => set(
        (state) => {
          const isSelected = state.selectedUsers.includes(userId);
          return {
            selectedUsers: isSelected
              ? state.selectedUsers.filter(id => id !== userId)
              : [...state.selectedUsers, userId],
          };
        },
        false,
        'toggleUserSelection'
      ),

      clearSelection: () => set(
        { selectedUsers: [] },
        false,
        'clearSelection'
      ),

      setFilters: (filters) => set(
        (state) => ({ filters: { ...state.filters, ...filters } }),
        false,
        'setFilters'
      ),

      setSearchQuery: (query) => set(
        { searchQuery: query },
        false,
        'setSearchQuery'
      ),

      setLoading: (loading) => set(
        { isLoading: loading },
        false,
        'setLoading'
      ),

      setError: (error) => set(
        { error },
        false,
        'setError'
      ),

      reset: () => set(initialState, false, 'reset'),
    }),
    {
      name: 'user-store',
    }
  )
);

// 선택적 셀렉터들
export const useUserSelectors = () => {
  const users = useUserStore(state => state.users);
  const selectedUsers = useUserStore(state => state.selectedUsers);
  const filters = useUserStore(state => state.filters);
  const searchQuery = useUserStore(state => state.searchQuery);
  const isLoading = useUserStore(state => state.isLoading);
  const error = useUserStore(state => state.error);

  // 필터링된 사용자 목록
  const filteredUsers = users.filter(user => {
    if (filters.status && user.status !== filters.status) return false;
    if (filters.role && user.adminRole !== filters.role) return false;
    if (filters.isActive !== undefined && user.isActive !== filters.isActive) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.email.toLowerCase().includes(query) ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // 상태별 사용자 수
  const userCounts = {
    total: users.length,
    pending: users.filter(user => user.status === UserStatus.PENDING).length,
    approved: users.filter(user => user.status === UserStatus.APPROVED).length,
    rejected: users.filter(user => user.status === UserStatus.REJECTED).length,
    suspended: users.filter(user => user.status === UserStatus.SUSPENDED).length,
    active: users.filter(user => user.isActive).length,
    inactive: users.filter(user => !user.isActive).length,
  };

  // 선택된 사용자들
  const selectedUserObjects = users.filter(user => selectedUsers.includes(user.id));

  return {
    users,
    filteredUsers,
    selectedUsers,
    selectedUserObjects,
    filters,
    searchQuery,
    isLoading,
    error,
    userCounts,
  };
};
