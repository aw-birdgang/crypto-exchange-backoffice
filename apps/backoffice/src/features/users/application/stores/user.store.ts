import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {AdminUser, UserFilters, UserStatus} from '@crypto-exchange/shared';

interface AdminUserState {
  // 상태
  adminUsers: AdminUser[];
  selectedAdminUsers: string[];
  filters: UserFilters;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // 액션
  setAdminUsers: (adminUsers: AdminUser[]) => void;
  addAdminUser: (adminUser: AdminUser) => void;
  updateAdminUser: (adminUserId: string, adminUserData: Partial<AdminUser>) => void;
  removeAdminUser: (adminUserId: string) => void;
  setSelectedAdminUsers: (adminUserIds: string[]) => void;
  toggleAdminUserSelection: (adminUserId: string) => void;
  clearSelection: () => void;
  setFilters: (filters: Partial<UserFilters>) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  adminUsers: [],
  selectedAdminUsers: [],
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

export const useAdminUserStore = create<AdminUserState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setAdminUsers: (adminUsers) => set({ adminUsers }, false, 'setAdminUsers'),

      addAdminUser: (adminUser) => set(
        (state) => ({ adminUsers: [...state.adminUsers, adminUser] }),
        false,
        'addAdminUser'
      ),

      updateAdminUser: (adminUserId, adminUserData) => set(
        (state) => ({
          adminUsers: state.adminUsers.map(adminUser =>
            adminUser.id === adminUserId ? { ...adminUser, ...adminUserData } : adminUser
          ),
        }),
        false,
        'updateAdminUser'
      ),

      removeAdminUser: (adminUserId) => set(
        (state) => ({
          adminUsers: state.adminUsers.filter(adminUser => adminUser.id !== adminUserId),
          selectedAdminUsers: state.selectedAdminUsers.filter(id => id !== adminUserId),
        }),
        false,
        'removeAdminUser'
      ),

      setSelectedAdminUsers: (adminUserIds) => set(
        { selectedAdminUsers: adminUserIds },
        false,
        'setSelectedAdminUsers'
      ),

      toggleAdminUserSelection: (adminUserId) => set(
        (state) => {
          const isSelected = state.selectedAdminUsers.includes(adminUserId);
          return {
            selectedAdminUsers: isSelected
              ? state.selectedAdminUsers.filter(id => id !== adminUserId)
              : [...state.selectedAdminUsers, adminUserId],
          };
        },
        false,
        'toggleAdminUserSelection'
      ),

      clearSelection: () => set(
        { selectedAdminUsers: [] },
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
      name: 'admin-user-store',
    }
  )
);

// 선택적 셀렉터들
export const useAdminUserSelectors = () => {
  const adminUsers = useAdminUserStore(state => state.adminUsers);
  const selectedAdminUsers = useAdminUserStore(state => state.selectedAdminUsers);
  const filters = useAdminUserStore(state => state.filters);
  const searchQuery = useAdminUserStore(state => state.searchQuery);
  const isLoading = useAdminUserStore(state => state.isLoading);
  const error = useAdminUserStore(state => state.error);

  // 필터링된 어드민 사용자 목록
  const filteredAdminUsers = adminUsers.filter(adminUser => {
    if (filters.status && adminUser.status !== filters.status) return false;
    if (filters.role && adminUser.adminRole !== filters.role) return false;
    if (filters.isActive !== undefined && adminUser.isActive !== filters.isActive) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        adminUser.email.toLowerCase().includes(query) ||
        adminUser.firstName.toLowerCase().includes(query) ||
        adminUser.lastName.toLowerCase().includes(query) ||
        adminUser.username.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // 상태별 어드민 사용자 수
  const adminUserCounts = {
    total: adminUsers.length,
    pending: adminUsers.filter(adminUser => adminUser.status === UserStatus.PENDING).length,
    approved: adminUsers.filter(adminUser => adminUser.status === UserStatus.APPROVED).length,
    rejected: adminUsers.filter(adminUser => adminUser.status === UserStatus.REJECTED).length,
    suspended: adminUsers.filter(adminUser => adminUser.status === UserStatus.SUSPENDED).length,
    active: adminUsers.filter(adminUser => adminUser.isActive).length,
    inactive: adminUsers.filter(adminUser => !adminUser.isActive).length,
  };

  // 선택된 어드민 사용자들
  const selectedAdminUserObjects = adminUsers.filter(adminUser => selectedAdminUsers.includes(adminUser.id));

  return {
    adminUsers,
    filteredAdminUsers,
    selectedAdminUsers,
    selectedAdminUserObjects,
    filters,
    searchQuery,
    isLoading,
    error,
    adminUserCounts,
  };
};
