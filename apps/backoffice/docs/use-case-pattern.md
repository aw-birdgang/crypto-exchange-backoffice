# 🔄 Use Case 패턴 가이드

## 📋 목차
- [Use Case 패턴 개요](#use-case-패턴-개요)
- [패턴 구조](#패턴-구조)
- [구현 방법](#구현-방법)
- [실제 예시](#실제-예시)
- [Best Practices](#best-practices)
- [테스트 전략](#테스트-전략)
- [성능 최적화](#성능-최적화)

## 🎯 Use Case 패턴 개요

Use Case 패턴은 Clean Architecture의 핵심 패턴으로, 비즈니스 로직을 캡슐화하고 애플리케이션의 유스케이스를 명확하게 표현합니다.

### 핵심 개념
- **비즈니스 로직 캡슐화**: 도메인 규칙을 Use Case에 집중
- **인터페이스 분리**: 구현체와 인터페이스 분리
- **의존성 역전**: 고수준 모듈이 저수준 모듈에 의존하지 않음
- **단일 책임**: 각 Use Case는 하나의 명확한 유스케이스만 담당

## 🏗️ 패턴 구조

### 1. 계층별 구조
```
Domain Layer (인터페이스)
    ↑
Application Layer (구현체)
    ↑
Infrastructure Layer (서비스)
```

### 2. 컴포넌트 관계
```
Use Case Interface (Domain)
    ↑ implements
Use Case Implementation (Application)
    ↑ depends on
Service (Infrastructure)
```

## 🛠️ 구현 방법

### 1. 인터페이스 정의 (Domain Layer)

```typescript
// domain/use-cases/user-management.use-case.interface.ts
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
```

### 2. 구현체 작성 (Application Layer)

```typescript
// application/use-cases/user-management.use-case.ts
export class AdminUserManagementUseCaseImpl implements AdminUserManagementUseCase {
  constructor(private readonly adminUserService: AdminUserService) {}

  async getAllUsers(filters?: UserFilters): Promise<AdminUser[]> {
    // 비즈니스 로직: 필터 검증 및 기본값 설정
    const validatedFilters = this.validateFilters(filters);
    return await this.adminUserService.getAllUsers(validatedFilters);
  }

  async approveUser(userId: string, approvalData: UserApprovalRequest): Promise<AdminUser> {
    // 비즈니스 로직: 승인 데이터 검증
    this.validateApprovalData(approvalData);
    return await this.adminUserService.approveUser(userId, approvalData);
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
}
```

### 3. 팩토리 패턴 (의존성 주입)

```typescript
// application/use-cases/use-case.factory.ts
export class UseCaseFactory {
  private static adminUserService: AdminUserService;
  private static adminUserManagementUseCase: AdminUserManagementUseCase;

  static setAdminUserService(adminUserService: AdminUserService): void {
    this.adminUserService = adminUserService;
  }

  static getAdminUserManagementUseCase(): AdminUserManagementUseCase {
    if (!this.adminUserManagementUseCase) {
      if (!this.adminUserService) {
        throw new Error('AdminUserService must be set before creating AdminUserManagementUseCase');
      }
      this.adminUserManagementUseCase = new AdminUserManagementUseCaseImpl(this.adminUserService);
    }
    return this.adminUserManagementUseCase;
  }

  static initialize(adminUserService: AdminUserService): void {
    this.setAdminUserService(adminUserService);
    this.getAdminUserManagementUseCase();
  }
}
```

### 4. React Hook에서 사용

```typescript
// application/hooks/use-users-improved.ts
export const useUsers = (filters?: UserFilters) => {
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userManagementUseCase.getAllUsers(filters),
    staleTime: 5 * 60 * 1000, // 5분
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
```

## 📝 실제 예시

### 1. 사용자 관리 Use Case

```typescript
// 사용자 목록 조회
const { data: users, isLoading } = useUsers({ status: 'PENDING' });

// 사용자 승인
const approveUser = useUserApproval();
const handleApprove = (userId: string) => {
  approveUser.mutate({
    userId,
    approvalData: { role: 'ADMIN', isActive: true }
  });
};
```

### 2. 검증 Use Case

```typescript
// 사용자 데이터 검증
export const useUserValidation = () => {
  const userValidationUseCase = UseCaseFactory.getAdminUserValidationUseCase();
  
  const validateUserData = useCallback(async (userData: Partial<AdminUser>) => {
    return await userValidationUseCase.validateUserData(userData);
  }, [userValidationUseCase]);

  return { validateUserData };
};
```

### 3. 분석 Use Case

```typescript
// 사용자 통계 조회
export const useUserAnalytics = () => {
  const userAnalyticsUseCase = UseCaseFactory.getAdminUserAnalyticsUseCase();
  
  const { data: userCountsByStatus } = useQuery({
    queryKey: ['users', 'analytics', 'status-counts'],
    queryFn: () => userAnalyticsUseCase.getUserCountsByStatus(),
    staleTime: 10 * 60 * 1000,
  });

  return { userCountsByStatus };
};
```

## ✅ Best Practices

### 1. 인터페이스 설계
```typescript
// ✅ 좋은 예: 명확하고 구체적인 메서드명
export interface UserManagementUseCase {
  getAllUsers(filters?: UserFilters): Promise<AdminUser[]>;
  approveUser(userId: string, data: UserApprovalRequest): Promise<AdminUser>;
}

// ❌ 나쁜 예: 모호한 메서드명
export interface UserUseCase {
  getUsers(): Promise<any[]>;
  processUser(id: string, data: any): Promise<any>;
}
```

### 2. 비즈니스 로직 분리
```typescript
// ✅ 좋은 예: 비즈니스 로직을 Use Case에 집중
export class UserManagementUseCaseImpl {
  async approveUser(userId: string, data: UserApprovalRequest): Promise<AdminUser> {
    // 비즈니스 규칙: 승인 가능 여부 확인
    const canApprove = await this.userValidationUseCase.canApproveUser(userId);
    if (!canApprove) {
      throw new Error('User cannot be approved');
    }
    
    // 비즈니스 규칙: 승인 데이터 검증
    this.validateApprovalData(data);
    
    return await this.userService.approveUser(userId, data);
  }
}
```

### 3. 에러 처리
```typescript
// ✅ 좋은 예: 구체적인 에러 메시지
private validateApprovalData(data: UserApprovalRequest): void {
  if (!data.role) {
    throw new Error('Role is required for user approval');
  }
  if (typeof data.isActive !== 'boolean') {
    throw new Error('isActive must be a boolean value');
  }
}

// ❌ 나쁜 예: 모호한 에러 메시지
private validateApprovalData(data: UserApprovalRequest): void {
  if (!data.role || typeof data.isActive !== 'boolean') {
    throw new Error('Invalid data');
  }
}
```

### 4. 의존성 주입
```typescript
// ✅ 좋은 예: 인터페이스에 의존
export class UserManagementUseCaseImpl {
  constructor(private readonly userService: IUserService) {}
}

// ❌ 나쁜 예: 구체 클래스에 의존
export class UserManagementUseCaseImpl {
  constructor(private readonly userService: ApiUserService) {}
}
```

## 🧪 테스트 전략

### 1. 단위 테스트
```typescript
// __tests__/user-management.use-case.test.ts
describe('UserManagementUseCaseImpl', () => {
  let useCase: UserManagementUseCaseImpl;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    mockUserService = createMockUserService();
    useCase = new UserManagementUseCaseImpl(mockUserService);
  });

  it('should validate search query minimum length', async () => {
    await expect(useCase.searchUsers('a'))
      .rejects.toThrow('Search query must be at least 2 characters long');
  });

  it('should validate approval data', async () => {
    const approvalData = { isActive: true } as any;
    
    await expect(useCase.approveUser('1', approvalData))
      .rejects.toThrow('Role is required for user approval');
  });
});
```

### 2. 통합 테스트
```typescript
// __tests__/user-management.integration.test.ts
describe('UserManagement Integration', () => {
  it('should approve user successfully', async () => {
    const userService = new AdminUserService();
    const useCase = new UserManagementUseCaseImpl(userService);
    
    const result = await useCase.approveUser('1', {
      role: 'ADMIN',
      isActive: true
    });
    
    expect(result).toBeDefined();
    expect(result.status).toBe('APPROVED');
  });
});
```

### 3. Hook 테스트
```typescript
// __tests__/use-users.test.tsx
describe('useUsers', () => {
  it('should fetch users successfully', async () => {
    const { result } = renderHook(() => useUsers());
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

## ⚡ 성능 최적화

### 1. Use Case 실행기 활용
```typescript
// Use Case 실행기로 성능 측정 및 캐싱
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
```

### 2. 캐싱 전략
```typescript
// React Query와 연동하여 캐싱
export const useUsers = (filters?: UserFilters) => {
  const userManagementUseCase = UseCaseFactory.getAdminUserManagementUseCase();
  
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userManagementUseCase.getAllUsers(filters),
    staleTime: 5 * 60 * 1000, // 5분 캐싱
    cacheTime: 10 * 60 * 1000, // 10분간 메모리에 유지
  });
};
```

### 3. 미들웨어 활용
```typescript
// 성능 측정 미들웨어
const performanceMiddleware = new PerformanceMiddleware();
const executor = UseCaseExecutorFactory.createWithMiddlewares([
  new LoggingMiddleware(console.log),
  performanceMiddleware,
  new CachingMiddleware(new Map()),
]);

// 성능 통계 조회
const stats = performanceMiddleware.getPerformanceStats('getAllUsers');
console.log(`Average execution time: ${stats?.average}ms`);
```

## 🎯 결론

Use Case 패턴은 Clean Architecture의 핵심으로, 다음과 같은 이점을 제공합니다:

- **비즈니스 로직 캡슐화**: 도메인 규칙을 명확하게 표현
- **테스트 용이성**: 의존성 주입으로 테스트 더블 사용 가능
- **유지보수성**: 명확한 책임 분리로 코드 이해 및 수정 용이
- **확장성**: 새로운 Use Case 추가 시 기존 코드 영향 최소화
- **재사용성**: 여러 컴포넌트에서 동일한 Use Case 재사용 가능

이러한 패턴을 통해 안정적이고 확장 가능한 애플리케이션을 구축할 수 있습니다.
