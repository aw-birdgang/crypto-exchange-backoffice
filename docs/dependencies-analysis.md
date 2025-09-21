# Crypto Exchange Backoffice - 주요 의존성 패키지 분석

## 프로젝트 개요

이 프로젝트는 암호화폐 거래소 백오피스 시스템으로, 모노레포 구조를 채택하여 API 서버(NestJS)와 프론트엔드(React)를 분리하여 개발되었습니다.

## 프로젝트 구조

```
crypto-exchange-backoffice/
├── apps/
│   ├── api/          # NestJS API 서버
│   └── backoffice/   # React 프론트엔드
├── packages/
│   └── shared/       # 공유 타입 및 유틸리티
└── docker/           # Docker 설정
```

## 주요 의존성 패키지 분석

### 1. 백엔드 (API) 의존성

#### 1.1 NestJS 핵심 패키지

**@nestjs/core, @nestjs/common, @nestjs/platform-express**
- **용도**: NestJS 프레임워크의 핵심 모듈
- **버전**: ^10.0.0
- **설명**: Node.js 기반의 확장 가능한 서버 사이드 애플리케이션을 구축하기 위한 프레임워크

```typescript
// main.ts 예시
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 글로벌 검증 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  await app.listen(3001);
}
```

**@nestjs/config**
- **용도**: 환경 변수 및 설정 관리
- **버전**: ^3.1.1
- **설명**: 애플리케이션 설정을 중앙화하고 환경별로 관리

```typescript
// config/app.config.ts 예시
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
}));
```

#### 1.2 인증 및 보안

**@nestjs/jwt, @nestjs/passport, passport-jwt, passport-local**
- **용도**: JWT 토큰 기반 인증 및 Passport 전략
- **버전**: ^10.2.0, ^10.0.3, ^4.0.1, ^1.0.0
- **설명**: 사용자 인증 및 권한 관리

```typescript
// auth.service.ts 예시
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.authenticateUser(loginDto.email, loginDto.password);
    const tokens = this.generateTokens(user);
    
    return {
      ...tokens,
      user: this.mapUserToResponse(user),
    };
  }

  private generateAccessToken(user: AdminUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.adminRole,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('app.jwt.secret'),
      expiresIn: this.configService.get<string>('app.jwt.expiresIn'),
    });
  }
}
```

**bcrypt**
- **용도**: 비밀번호 해싱
- **버전**: ^5.1.1
- **설명**: 안전한 비밀번호 저장을 위한 해싱 알고리즘

```typescript
// 비밀번호 해싱 예시
const bcryptRounds = 12;
const hashedPassword = await bcrypt.hash(password, bcryptRounds);
const isPasswordValid = await bcrypt.compare(password, hashedPassword);
```

#### 1.3 데이터베이스

**@nestjs/typeorm, typeorm, mysql2**
- **용도**: ORM 및 MySQL 데이터베이스 연결
- **버전**: ^10.0.0, ^0.3.17, ^3.6.5
- **설명**: TypeORM을 사용한 데이터베이스 ORM 및 MySQL 연결

```typescript
// admin-user.entity.ts 예시
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: AdminUserRole })
  adminRole: AdminUserRole;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 1.4 API 문서화

**@nestjs/swagger, swagger-ui-express**
- **용도**: API 문서 자동 생성 및 Swagger UI 제공
- **버전**: ^7.1.16, ^5.0.0
- **설명**: OpenAPI 스펙 기반의 API 문서화

```typescript
// main.ts Swagger 설정 예시
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Crypto Exchange API')
  .setDescription('암호화폐 거래소 백오피스 API 문서')
  .setVersion('2.0.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api-docs', app, document);
```

#### 1.5 검증 및 변환

**class-validator, class-transformer**
- **용도**: DTO 검증 및 객체 변환
- **버전**: ^0.14.0, ^0.5.1
- **설명**: 데코레이터 기반의 검증 및 변환 로직

```typescript
// auth.dto.ts 예시
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  email: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
  password: string;
}
```

#### 1.6 캐싱 및 성능

**ioredis**
- **용도**: Redis 클라이언트
- **버전**: ^5.3.2
- **설명**: 고성능 캐싱 및 세션 관리

```typescript
// cache.service.ts 예시
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
    });
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } else {
      await this.redis.set(key, JSON.stringify(value));
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }
}
```

### 2. 프론트엔드 (Backoffice) 의존성

#### 2.1 React 핵심

**react, react-dom**
- **용도**: React 라이브러리
- **버전**: ^18.2.0
- **설명**: 사용자 인터페이스 구축을 위한 라이브러리

```typescript
// App.tsx 예시
import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, lazy, useState } from 'react';
import { App as AntdApp } from 'antd';

function AppComponent() {
  const { isAuthenticated, isLoading, user, accessToken } = useAuthStore();
  const [isAppReady, setIsAppReady] = useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user || !accessToken) {
    return <LoginPage />;
  }

  return (
    <div className={`app-container ${isAppReady ? 'app-ready' : 'app-loading'}`}>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to={ROUTES.WALLET.TRANSACTIONS} replace />} />
          <Route path={ROUTES.WALLET.TRANSACTIONS} element={<WalletTransactionsPage />} />
        </Routes>
      </AppLayout>
    </div>
  );
}
```

#### 2.2 상태 관리

**zustand**
- **용도**: 경량 상태 관리 라이브러리
- **버전**: ^4.4.1
- **설명**: Redux 대안으로 간단하고 직관적인 상태 관리

```typescript
// auth.store.ts 예시
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (user: AdminUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      login: (user, accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user_info', JSON.stringify(user));
        
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
```

**@tanstack/react-query**
- **용도**: 서버 상태 관리 및 데이터 페칭
- **버전**: ^5.0.0
- **설명**: 서버 상태와 클라이언트 상태를 분리하여 관리

```typescript
// useUsers.ts 예시
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';

export const useUsers = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
    staleTime: 5 * 60 * 1000, // 5분
  });

  const createUserMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    users,
    isLoading,
    error,
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
  };
};
```

#### 2.3 UI 라이브러리

**antd, @ant-design/icons**
- **용도**: UI 컴포넌트 라이브러리
- **버전**: ^5.9.0, ^5.2.6
- **설명**: 엔터프라이즈급 UI 디자인 언어 및 React UI 라이브러리

```typescript
// UserManagementPage.tsx 예시
import { Table, Button, Space, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const UserManagementPage = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const columns = [
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '이름',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: '역할',
      dataIndex: 'adminRole',
      key: 'adminRole',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '액션',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            수정
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          사용자 추가
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="id"
        loading={isLoading}
      />
      
      <Modal
        title="사용자 추가"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="email" label="이메일" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="firstName" label="이름" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="adminRole" label="역할" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="ADMIN">관리자</Select.Option>
              <Select.Option value="SUPPORT">지원팀</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
```

#### 2.4 폼 관리

**react-hook-form, @hookform/resolvers, zod**
- **용도**: 폼 상태 관리 및 검증
- **버전**: ^7.45.4, ^3.3.1, ^3.22.2
- **설명**: 성능 최적화된 폼 라이브러리와 스키마 검증

```typescript
// UserForm.tsx 예시
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  firstName: z.string().min(1, '이름은 필수입니다'),
  lastName: z.string().min(1, '성은 필수입니다'),
  adminRole: z.enum(['ADMIN', 'SUPPORT'], {
    required_error: '역할을 선택해주세요',
  }),
});

type UserFormData = z.infer<typeof userSchema>;

const UserForm = ({ onSubmit, initialData }: UserFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData,
  });

  const onFormSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div>
        <label>이메일</label>
        <input {...register('email')} />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      
      <div>
        <label>이름</label>
        <input {...register('firstName')} />
        {errors.firstName && <span>{errors.firstName.message}</span>}
      </div>
      
      <div>
        <label>성</label>
        <input {...register('lastName')} />
        {errors.lastName && <span>{errors.lastName.message}</span>}
      </div>
      
      <div>
        <label>역할</label>
        <select {...register('adminRole')}>
          <option value="">역할을 선택하세요</option>
          <option value="ADMIN">관리자</option>
          <option value="SUPPORT">지원팀</option>
        </select>
        {errors.adminRole && <span>{errors.adminRole.message}</span>}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '저장 중...' : '저장'}
      </button>
    </form>
  );
};
```

#### 2.5 라우팅

**react-router-dom**
- **용도**: 클라이언트 사이드 라우팅
- **버전**: ^6.15.0
- **설명**: React 애플리케이션의 라우팅 관리

```typescript
// App.tsx 라우팅 예시
import { Navigate, Route, Routes } from 'react-router-dom';
import { lazy } from 'react';

const PermissionManagementPage = lazy(() => 
  import('./features/auth/presentation/pages/PermissionManagementPage')
    .then(m => ({ default: m.PermissionManagementPage }))
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.WALLET.TRANSACTIONS} replace />} />
      
      <Route 
        path={ROUTES.WALLET.TRANSACTIONS} 
        element={
          <LazyPage>
            <WalletTransactionsPage />
          </LazyPage>
        } 
      />
      
      <Route 
        path={ROUTES.ADMIN.USERS} 
        element={
          <LazyPage>
            <AdminUserManagementPage />
          </LazyPage>
        } 
      />
      
      <Route 
        path={ROUTES.ADMIN.PERMISSIONS} 
        element={
          <LazyPage>
            <PermissionManagementPage />
          </LazyPage>
        } 
      />
      
      <Route path="*" element={<Navigate to={ROUTES.WALLET.TRANSACTIONS} replace />} />
    </Routes>
  );
}
```

#### 2.6 차트 및 데이터 시각화

**recharts**
- **용도**: React 차트 라이브러리
- **버전**: ^2.8.0
- **설명**: 데이터 시각화를 위한 차트 컴포넌트

```typescript
// TransactionChart.tsx 예시
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TransactionChart = ({ data }: { data: TransactionData[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="amount" 
          stroke="#8884d8" 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

### 3. 공유 패키지

**@crypto-exchange/shared**
- **용도**: 공유 타입 및 유틸리티
- **설명**: API와 프론트엔드 간 공유되는 타입 정의 및 상수

```typescript
// shared/src/types/api.types.ts 예시
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  adminRole: AdminUserRole;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum AdminUserRole {
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: AdminUserRole;
  type: 'access' | 'refresh';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

### 4. 개발 도구

#### 4.1 빌드 도구

**vite**
- **용도**: 프론트엔드 빌드 도구
- **버전**: ^4.4.5
- **설명**: 빠른 개발 서버와 최적화된 프로덕션 빌드

```typescript
// vite.config.ts 예시
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

#### 4.2 테스팅

**vitest, @testing-library/react, cypress**
- **용도**: 단위 테스트 및 E2E 테스트
- **버전**: ^0.34.0, ^13.4.0, ^13.0.0
- **설명**: Jest 대안인 Vitest와 React 컴포넌트 테스트, E2E 테스트

```typescript
// user-management.use-case.test.ts 예시
import { describe, it, expect, vi } from 'vitest';
import { UserManagementUseCase } from '../user-management.use-case';

describe('UserManagementUseCase', () => {
  it('should create user successfully', async () => {
    const mockUserService = {
      createUser: vi.fn().mockResolvedValue({ id: '1', email: 'test@example.com' }),
    };

    const useCase = new UserManagementUseCase(mockUserService);
    const result = await useCase.createUser({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(result.success).toBe(true);
    expect(mockUserService.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });
  });
});
```

#### 4.3 코드 품질

**eslint, prettier, typescript**
- **용도**: 코드 품질 관리 및 포맷팅
- **버전**: ^8.45.0, ^3.0.0, ^5.1.6
- **설명**: 코드 린팅, 포맷팅, 타입 체킹

```json
// .eslintrc.js 예시
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "prettier"],
  "rules": {
    "prettier/prettier": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

## 패키지 관리

### pnpm 워크스페이스

이 프로젝트는 pnpm 워크스페이스를 사용하여 모노레포를 관리합니다.

```json
// pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 의존성 설치 명령어

```bash
# 전체 프로젝트 의존성 설치
pnpm install

# 특정 앱의 의존성 설치
pnpm --filter @crypto-exchange/api install
pnpm --filter @crypto-exchange/backoffice install

# 개발 서버 실행
pnpm dev

# 빌드
pnpm build
```

## 보안 고려사항

### 1. 인증 및 권한
- JWT 토큰 기반 인증
- 역할 기반 접근 제어 (RBAC)
- 비밀번호 bcrypt 해싱

### 2. API 보안
- Helmet을 통한 보안 헤더 설정
- CORS 설정
- Rate limiting
- 입력 검증 및 sanitization

### 3. 데이터 보안
- TypeORM을 통한 SQL 인젝션 방지
- 환경 변수를 통한 민감한 정보 관리
- HTTPS 강제 (프로덕션)

## 성능 최적화

### 1. 프론트엔드
- React.lazy를 통한 코드 스플리팅
- Zustand를 통한 효율적인 상태 관리
- React Query를 통한 서버 상태 캐싱

### 2. 백엔드
- Redis를 통한 캐싱
- TypeORM 쿼리 최적화
- 압축 미들웨어

### 3. 빌드 최적화
- Vite를 통한 빠른 빌드
- Tree shaking
- 번들 크기 최적화

## 결론

이 프로젝트는 현대적인 웹 개발 스택을 사용하여 확장 가능하고 유지보수가 용이한 암호화폐 거래소 백오피스 시스템을 구축했습니다. NestJS와 React를 중심으로 한 풀스택 아키텍처, TypeScript를 통한 타입 안전성, 그리고 다양한 최적화 기법을 통해 안정적이고 성능이 우수한 시스템을 구현했습니다.
