# Clean Architecture 가이드

## 🏗️ 아키텍처 개요

이 프로젝트는 Clean Architecture 원칙을 따라 설계되었습니다. 각 계층은 명확한 책임을 가지며, 의존성은 안쪽으로만 향합니다.

## 📁 디렉토리 구조

```
src/
├── features/                          # 기능별 모듈
│   ├── users/                        # 사용자 관리 기능
│   │   ├── domain/                   # 도메인 계층
│   │   │   └── use-cases/           # Use Case 인터페이스
│   │   ├── application/              # 애플리케이션 계층
│   │   │   ├── use-cases/           # Use Case 구현체
│   │   │   ├── hooks/               # React Hooks
│   │   │   ├── services/            # 인프라 서비스
│   │   │   └── stores/              # 상태 관리
│   │   └── presentation/            # 프레젠테이션 계층
│   │       ├── components/          # React 컴포넌트
│   │       └── pages/               # 페이지 컴포넌트
│   ├── auth/                        # 인증 기능
│   ├── dashboard/                   # 대시보드 기능
│   ├── wallet/                      # 지갑 기능
│   └── customer/                    # 고객 지원 기능
├── shared/                          # 공통 모듈
│   ├── domain/                      # 공통 도메인
│   │   └── use-cases/              # 기본 Use Case 인터페이스
│   ├── application/                 # 공통 애플리케이션
│   │   └── use-cases/              # Use Case 실행기, 미들웨어
│   ├── components/                  # 공통 UI 컴포넌트
│   ├── hooks/                       # 공통 Hooks
│   ├── services/                    # 공통 서비스
│   └── utils/                       # 유틸리티
└── config/                          # 설정
    └── app.config.ts               # 앱 설정
```

## 🎯 계층별 책임

### **1. Domain Layer (도메인 계층)**
- **책임**: 비즈니스 규칙과 엔티티 정의
- **구성요소**:
  - Use Case 인터페이스
  - 도메인 엔티티
  - 비즈니스 규칙

```typescript
// 예시: 사용자 관리 Use Case 인터페이스
export interface UserManagementUseCase {
  getAllUsers(filters?: UserFilters): Promise<AdminUser[]>;
  approveUser(userId: string, approvalData: UserApprovalRequest): Promise<AdminUser>;
  // ... 기타 비즈니스 메서드
}
```

### **2. Application Layer (애플리케이션 계층)**
- **책임**: Use Case 구현, 비즈니스 로직 실행
- **구성요소**:
  - Use Case 구현체
  - React Hooks
  - 서비스 (인프라 계층)
  - 상태 관리

```typescript
// 예시: 사용자 관리 Use Case 구현체
export class UserManagementUseCaseImpl implements UserManagementUseCase {
  constructor(private readonly userService: UserService) {}
  
  async getAllUsers(filters?: UserFilters): Promise<AdminUser[]> {
    // 비즈니스 로직: 필터 검증 및 기본값 설정
    const validatedFilters = this.validateFilters(filters);
    return await this.userService.getAllUsers(validatedFilters);
  }
}
```

### **3. Presentation Layer (프레젠테이션 계층)**
- **책임**: UI 렌더링, 사용자 상호작용 처리
- **구성요소**:
  - React 컴포넌트
  - 페이지 컴포넌트
  - UI 로직

```typescript
// 예시: 사용자 목록 컴포넌트
export const UserTable: React.FC = () => {
  const { data: users, isLoading } = useUsers();
  const { approveUser } = useUserApproval();
  
  return (
    <div>
      {isLoading ? <LoadingSpinner /> : <UserList users={users} />}
    </div>
  );
};
```

## 🔄 Use Case 패턴

### **Use Case 인터페이스 정의**
```typescript
// domain/use-cases/user-management.use-case.interface.ts
export interface UserManagementUseCase {
  getAllUsers(filters?: UserFilters): Promise<AdminUser[]>;
  approveUser(userId: string, approvalData: UserApprovalRequest): Promise<AdminUser>;
  // ... 기타 메서드
}
```

### **Use Case 구현체**
```typescript
// application/use-cases/user-management.use-case.ts
export class UserManagementUseCaseImpl implements UserManagementUseCase {
  constructor(private readonly userService: UserService) {}
  
  async getAllUsers(filters?: UserFilters): Promise<AdminUser[]> {
    // 비즈니스 로직 구현
    const validatedFilters = this.validateFilters(filters);
    return await this.userService.getAllUsers(validatedFilters);
  }
}
```

### **Use Case 팩토리**
```typescript
// application/use-cases/use-case.factory.ts
export class UseCaseFactory {
  static getUserManagementUseCase(): UserManagementUseCase {
    if (!this.userManagementUseCase) {
      this.userManagementUseCase = new UserManagementUseCaseImpl(this.userService);
    }
    return this.userManagementUseCase;
  }
}
```

### **React Hooks에서 사용**
```typescript
// application/hooks/use-users.ts
export const useUsers = (filters?: UserFilters) => {
  const userManagementUseCase = UseCaseFactory.getUserManagementUseCase();
  
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userManagementUseCase.getAllUsers(filters),
    staleTime: 5 * 60 * 1000,
  });
};
```

## 🛠️ Use Case 실행기

### **기본 실행기**
```typescript
import { UseCaseExecutorFactory } from '@/shared/application/use-cases/use-case.executor';

const executor = UseCaseExecutorFactory.createDefault();
```

### **미들웨어 추가**
```typescript
import { LoggingMiddleware, PerformanceMiddleware } from '@/shared/application/use-cases/use-case.executor';

const executor = UseCaseExecutorFactory.createWithMiddlewares([
  new LoggingMiddleware(console.log),
  new PerformanceMiddleware(),
]);
```

### **Use Case 실행**
```typescript
const result = await executor.execute(
  (context) => userManagementUseCase.getAllUsers(filters),
  { requestId: 'req_123', timestamp: new Date(), metadata: {} }
);
```

## 🧪 테스트 전략

### **Use Case 단위 테스트**
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
});
```

### **Hook 테스트**
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

## 📊 성능 최적화

### **캐싱**
```typescript
// 캐싱 미들웨어 사용
const executor = UseCaseExecutorFactory.createWithMiddlewares([
  new CachingMiddleware(new Map(), 5 * 60 * 1000), // 5분 TTL
]);
```

### **성능 측정**
```typescript
// 성능 미들웨어 사용
const performanceMiddleware = new PerformanceMiddleware();
const executor = UseCaseExecutorFactory.createWithMiddlewares([performanceMiddleware]);

// 성능 통계 조회
const stats = performanceMiddleware.getPerformanceStats('getAllUsers');
console.log(`Average execution time: ${stats?.average}ms`);
```

## 🔒 보안 고려사항

### **권한 검증**
```typescript
export class UserManagementUseCaseImpl {
  async deleteUser(userId: string): Promise<void> {
    // 비즈니스 로직: 삭제 권한 검증
    const canDelete = await this.userValidationUseCase.canDeleteUser(userId);
    if (!canDelete) {
      throw new Error('Insufficient permissions to delete user');
    }
    
    await this.userService.deleteUser(userId);
  }
}
```

### **입력 검증**
```typescript
private validateApprovalData(approvalData: UserApprovalRequest): void {
  if (!approvalData.role) {
    throw new Error('Role is required for user approval');
  }
  if (typeof approvalData.isActive !== 'boolean') {
    throw new Error('isActive must be a boolean value');
  }
}
```

## 🚀 확장성

### **새로운 기능 추가**
1. **도메인 계층**: Use Case 인터페이스 정의
2. **애플리케이션 계층**: Use Case 구현체 작성
3. **프레젠테이션 계층**: React 컴포넌트 작성

### **미들웨어 추가**
```typescript
export class CustomMiddleware implements UseCaseMiddleware {
  async before(context: UseCaseContext): Promise<UseCaseContext> {
    // 전처리 로직
    return context;
  }
  
  async after<T>(result: UseCaseResult<T>, context: UseCaseContext): Promise<UseCaseResult<T>> {
    // 후처리 로직
    return result;
  }
  
  async onError(error: Error, context: UseCaseContext): Promise<void> {
    // 에러 처리 로직
  }
}
```

## 📈 모니터링

### **로깅**
```typescript
// 로깅 미들웨어 사용
const logger = (level: LogLevel, message: string, context?: any) => {
  console.log(`[${level}] ${message}`, context);
};

const executor = UseCaseExecutorFactory.createWithMiddlewares([
  new LoggingMiddleware(logger),
]);
```

### **메트릭 수집**
```typescript
// 성능 메트릭 수집
const performanceMiddleware = new PerformanceMiddleware();
const stats = performanceMiddleware.getPerformanceStats('getAllUsers');

// 메트릭 전송
analytics.track('use_case_performance', {
  useCase: 'getAllUsers',
  averageTime: stats?.average,
  executionCount: stats?.count,
});
```

## 🎯 Best Practices

### **1. 의존성 주입**
- Use Case는 인터페이스에 의존
- 구현체는 팩토리에서 주입

### **2. 에러 처리**
- 비즈니스 에러는 Use Case에서 처리
- 기술적 에러는 실행기에서 처리

### **3. 테스트**
- Use Case는 단위 테스트
- Hook은 통합 테스트
- 컴포넌트는 E2E 테스트

### **4. 성능**
- 캐싱 전략 수립
- 성능 모니터링
- 지연 로딩 적용

### **5. 보안**
- 입력 검증
- 권한 확인
- 로깅 및 감사

## 🔧 개발 도구

### **코드 생성**
```bash
# Use Case 인터페이스 생성
npm run generate:use-case-interface -- --name=UserManagement

# Use Case 구현체 생성
npm run generate:use-case-impl -- --name=UserManagement

# Hook 생성
npm run generate:hook -- --name=useUsers
```

### **테스트 실행**
```bash
# 단위 테스트
npm run test:unit

# 통합 테스트
npm run test:integration

# E2E 테스트
npm run test:e2e
```

### **성능 분석**
```bash
# 성능 프로파일링
npm run analyze:performance

# 번들 분석
npm run analyze:bundle
```

이 Clean Architecture 구조를 통해 확장 가능하고 유지보수하기 쉬운 코드베이스를 구축할 수 있습니다! 🎉
