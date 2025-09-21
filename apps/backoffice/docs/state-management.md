# 🗃️ 상태 관리 (State Management) 가이드

## 📋 목차
- [상태 관리 개요](#상태-관리-개요)
- [계층별 상태 관리](#계층별-상태-관리)
- [Zustand Store](#zustand-store)
- [TanStack Query](#tanstack-query)
- [상태 동기화](#상태-동기화)
- [성능 최적화](#성능-최적화)
- [Best Practices](#best-practices)

## 🎯 상태 관리 개요

Crypto Exchange Backoffice는 계층별로 다른 상태 관리 전략을 사용하여 효율적이고 일관된 상태 관리를 구현합니다.

### 상태 관리 전략
- **로컬 상태**: `useState`, `useReducer` (컴포넌트 내부)
- **전역 상태**: `Zustand` (애플리케이션 전역)
- **서버 상태**: `TanStack Query` (API 데이터)
- **폼 상태**: `React Hook Form` (폼 데이터)

## 🏗️ 계층별 상태 관리

### 1. Presentation Layer (프레젠테이션 계층)

```typescript
// 컴포넌트 내부 상태
const UserTable: React.FC = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState<UserFilters>({});
  const [isLoading, setIsLoading] = useState(false);

  // 전역 상태 구독
  const { user, permissions } = useAuthStore();
  const { users, fetchUsers } = useUsers();

  // 서버 상태 구독
  const { data: userStats } = useUserStats();

  return (
    <div>
      {/* UI 렌더링 */}
    </div>
  );
};
```

### 2. Application Layer (애플리케이션 계층)

```typescript
// Zustand Store
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  permissions: [],
  isAuthenticated: false,
  
  login: async (credentials) => {
    const response = await authService.login(credentials);
    set({ 
      user: response.user, 
      permissions: response.permissions,
      isAuthenticated: true 
    });
  },
  
  logout: () => {
    set({ 
      user: null, 
      permissions: [], 
      isAuthenticated: false 
    });
  },
}));

// TanStack Query Hooks
export const useUsers = (filters?: UserFilters) => {
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userManagementUseCase.getAllUsers(filters),
    staleTime: 5 * 60 * 1000,
  });
};
```

### 3. Domain Layer (도메인 계층)

```typescript
// 도메인 엔티티
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  role: AdminUserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 도메인 상태 타입
export interface UserState {
  users: AdminUser[];
  selectedUser: AdminUser | null;
  filters: UserFilters;
  isLoading: boolean;
  error: string | null;
}
```

## 🐻 Zustand Store

### 1. 인증 상태 관리

```typescript
// features/auth/application/stores/auth.store.ts
interface AuthState {
  user: AdminUser | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.login(credentials);
      set({
        user: response.user,
        permissions: response.permissions,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      permissions: [],
      isAuthenticated: false,
      error: null,
    });
  },

  refreshTokens: (accessToken, refreshToken) => {
    set((state) => ({
      ...state,
      // 토큰은 localStorage에 저장되므로 상태 업데이트만
    }));
  },

  clearAuth: () => {
    set({
      user: null,
      permissions: [],
      isAuthenticated: false,
      error: null,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
```

### 2. 권한 상태 관리

```typescript
// features/auth/application/stores/permission.store.ts
interface PermissionState {
  permissions: Permission[];
  roles: Role[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPermissions: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  checkPermission: (resource: string, action: string) => boolean;
  checkMenuAccess: (menuKey: string) => boolean;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: [],
  roles: [],
  isLoading: false,
  error: null,

  fetchPermissions: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const permissions = await permissionService.getMyPermissions();
      set({ permissions, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchRoles: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const roles = await permissionService.getRoles();
      set({ roles, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  checkPermission: (resource, action) => {
    const { permissions } = get();
    return permissions.some(p => 
      p.resource === resource && p.actions.includes(action)
    );
  },

  checkMenuAccess: (menuKey) => {
    const { permissions } = get();
    return permissions.some(p => 
      p.resource === 'menu' && p.actions.includes(menuKey)
    );
  },
}));
```

### 3. 사용자 상태 관리

```typescript
// features/users/application/stores/user.store.ts
interface UserState {
  users: AdminUser[];
  selectedUsers: string[];
  filters: UserFilters;
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUsers: (users: AdminUser[]) => void;
  addUser: (user: AdminUser) => void;
  updateUser: (user: AdminUser) => void;
  removeUser: (userId: string) => void;
  setSelectedUsers: (userIds: string[]) => void;
  setFilters: (filters: UserFilters) => void;
  setPagination: (pagination: PaginationState) => void;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  selectedUsers: [],
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,

  setUsers: (users) => set({ users }),
  
  addUser: (user) => set((state) => ({
    users: [...state.users, user]
  })),
  
  updateUser: (user) => set((state) => ({
    users: state.users.map(u => u.id === user.id ? user : u)
  })),
  
  removeUser: (userId) => set((state) => ({
    users: state.users.filter(u => u.id !== userId)
  })),
  
  setSelectedUsers: (userIds) => set({ selectedUsers: userIds }),
  
  setFilters: (filters) => set({ filters }),
  
  setPagination: (pagination) => set({ pagination }),
  
  clearError: () => set({ error: null }),
}));
```

## 🔄 TanStack Query

### 1. 서버 상태 관리

```typescript
// features/users/application/hooks/use-users-improved.ts
export const useUsers = (filters?: UserFilters) => {
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userManagementUseCase.getAllUsers(filters),
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useUserApproval = () => {
  const queryClient = useQueryClient();
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useMutation({
    mutationFn: ({ userId, approvalData }: { userId: string; approvalData: UserApprovalRequest }) =>
      userManagementUseCase.approveUser(userId, approvalData),
    onSuccess: (data, variables) => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
      
      // 낙관적 업데이트
      queryClient.setQueryData(['users'], (oldData: AdminUser[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(user => 
          user.id === variables.userId ? { ...user, ...data } : user
        );
      });
    },
    onError: (error) => {
      console.error('User approval failed:', error);
    },
  });
};
```

### 2. 쿼리 키 관리

```typescript
// shared/utils/query-keys.ts
export const queryKeys = {
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: UserFilters) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    stats: () => [...queryKeys.users.all, 'stats'] as const,
  },
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    permissions: () => [...queryKeys.auth.all, 'permissions'] as const,
  },
} as const;

// 사용 예시
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters || {}),
    queryFn: () => userManagementUseCase.getAllUsers(filters),
  });
};
```

### 3. 프리페칭 및 캐싱

```typescript
// features/users/application/hooks/use-users-prefetch.ts
export const useUserPrefetch = () => {
  const queryClient = useQueryClient();
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();

  const prefetchUsers = useCallback(async (filters?: UserFilters) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.users.list(filters || {}),
      queryFn: () => userManagementUseCase.getAllUsers(filters),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient, userManagementUseCase]);

  const prefetchUserDetail = useCallback(async (userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.users.detail(userId),
      queryFn: () => userManagementUseCase.getUserById(userId),
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClient, userManagementUseCase]);

  return { prefetchUsers, prefetchUserDetail };
};
```

## 🔄 상태 동기화

### 1. Store 간 동기화

```typescript
// features/users/application/hooks/use-users-sync.ts
export const useUsersSync = () => {
  const { setUsers, addUser, updateUser, removeUser } = useUserStore();
  const { data: users } = useUsers();

  // 서버 상태를 로컬 상태와 동기화
  useEffect(() => {
    if (users) {
      setUsers(users);
    }
  }, [users, setUsers]);

  // 낙관적 업데이트
  const handleUserUpdate = useCallback((updatedUser: AdminUser) => {
    updateUser(updatedUser);
  }, [updateUser]);

  return { handleUserUpdate };
};
```

### 2. 캐시 동기화

```typescript
// features/users/application/hooks/use-users-cache.ts
export const useUsersCache = () => {
  const queryClient = useQueryClient();

  const invalidateUsersCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  }, [queryClient]);

  const updateUsersCache = useCallback((updatedUser: AdminUser) => {
    queryClient.setQueryData(queryKeys.users.all, (oldData: AdminUser[] | undefined) => {
      if (!oldData) return oldData;
      return oldData.map(user => user.id === updatedUser.id ? updatedUser : user);
    });
  }, [queryClient]);

  const addUserToCache = useCallback((newUser: AdminUser) => {
    queryClient.setQueryData(queryKeys.users.all, (oldData: AdminUser[] | undefined) => {
      if (!oldData) return [newUser];
      return [newUser, ...oldData];
    });
  }, [queryClient]);

  return {
    invalidateUsersCache,
    updateUsersCache,
    addUserToCache,
  };
};
```

## ⚡ 성능 최적화

### 1. 메모이제이션

```typescript
// 컴포넌트 메모이제이션
const UserTable = React.memo<UserTableProps>(({ users, onUserSelect }) => {
  const handleUserSelect = useCallback((user: AdminUser) => {
    onUserSelect(user);
  }, [onUserSelect]);

  return (
    <div>
      {users.map(user => (
        <UserRow key={user.id} user={user} onSelect={handleUserSelect} />
      ))}
    </div>
  );
});

// 계산 메모이제이션
const UserStats = () => {
  const { users } = useUserStore();
  
  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      pending: users.filter(u => u.status === 'PENDING').length,
    };
  }, [users]);

  return <div>{/* 통계 UI */}</div>;
};
```

### 2. 가상화

```typescript
// 가상 스크롤링
import { FixedSizeList as List } from 'react-window';

const VirtualizedUserTable = ({ users }: { users: AdminUser[] }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <UserRow user={users[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={users.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### 3. 지연 로딩

```typescript
// 컴포넌트 지연 로딩
const UserManagementPage = lazy(() => import('./UserManagementPage'));
const RoleManagementPage = lazy(() => import('./RoleManagementPage'));

// 라우터에서 사용
<Route path="/users" element={
  <Suspense fallback={<LoadingSpinner />}>
    <UserManagementPage />
  </Suspense>
} />
```

## ✅ Best Practices

### 1. 상태 구조 설계

```typescript
// ✅ 좋은 예: 평면적이고 정규화된 상태
interface AppState {
  users: {
    byId: Record<string, AdminUser>;
    allIds: string[];
    selectedIds: string[];
  };
  ui: {
    modals: {
      userApproval: boolean;
      userEdit: boolean;
    };
    filters: UserFilters;
  };
}

// ❌ 나쁜 예: 중첩된 상태
interface AppState {
  users: {
    list: AdminUser[];
    selected: AdminUser[];
    ui: {
      modals: {
        userApproval: boolean;
      };
    };
  };
}
```

### 2. 액션 설계

```typescript
// ✅ 좋은 예: 명확하고 원자적인 액션
const useUserStore = create<UserState>((set) => ({
  users: [],
  
  addUser: (user) => set((state) => ({
    users: [...state.users, user]
  })),
  
  updateUser: (user) => set((state) => ({
    users: state.users.map(u => u.id === user.id ? user : u)
  })),
}));

// ❌ 나쁜 예: 복잡한 액션
const useUserStore = create<UserState>((set) => ({
  users: [],
  
  handleUserAction: (action, user) => {
    // 복잡한 로직이 섞인 액션
    if (action === 'add') {
      // 추가 로직
    } else if (action === 'update') {
      // 업데이트 로직
    }
  },
}));
```

### 3. 에러 처리

```typescript
// ✅ 좋은 예: 구조화된 에러 처리
const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userManagementUseCase.getAllUsers(filters),
    onError: (error) => {
      console.error('Failed to fetch users:', error);
      // 에러 알림 표시
      toast.error('사용자 목록을 불러오는데 실패했습니다.');
    },
    retry: (failureCount, error) => {
      // 특정 에러는 재시도하지 않음
      if (error.status === 404) return false;
      return failureCount < 3;
    },
  });
};
```

## 🎯 결론

효율적인 상태 관리를 통해 다음과 같은 이점을 얻을 수 있습니다:

- **성능**: 적절한 캐싱과 메모이제이션으로 성능 최적화
- **일관성**: 중앙화된 상태 관리로 데이터 일관성 보장
- **개발자 경험**: 명확한 상태 구조로 개발 생산성 향상
- **사용자 경험**: 빠른 응답과 부드러운 UI 제공

계층별로 적절한 상태 관리 전략을 사용하여 확장 가능하고 유지보수하기 쉬운 애플리케이션을 구축할 수 있습니다.
