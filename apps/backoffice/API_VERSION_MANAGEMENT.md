# API 버전 관리 가이드

## 🚀 개선된 API 버전 관리 시스템

이 프로젝트는 환경 변수 기반의 API 버전 관리 시스템을 사용합니다.

## 📁 파일 구조

```
src/
├── config/
│   ├── api.config.ts          # API 설정 중앙 관리
│   └── app.config.ts          # 앱 설정
├── shared/
│   └── utils/
│       └── api-path-builder.ts # API 경로 빌더
└── features/
    └── */services/
        └── *.service.ts       # 서비스에서 ApiPathBuilder 사용
```

## 🔧 환경 변수 설정

### .env.development
```bash
VITE_API_BASE_URL=http://localhost:3001
VITE_API_VERSION=v1
VITE_NODE_ENV=development
```

### .env.staging
```bash
VITE_API_BASE_URL=https://api-staging.crypto-exchange.com
VITE_API_VERSION=v1
VITE_NODE_ENV=staging
```

### .env.production
```bash
VITE_API_BASE_URL=https://api.crypto-exchange.com
VITE_API_VERSION=v2
VITE_NODE_ENV=production
```

## 💻 사용법

### 1. 기본 사용법

```typescript
import { ApiPathBuilder } from '@/shared/utils/api-path-builder';

// 기본 경로 생성
const url = ApiPathBuilder.build('/admin/users');
// 결과: http://localhost:3001/api/v1/admin/users

// 타입 안전한 경로 생성
const authUrl = ApiPathBuilder.auth('LOGIN');
// 결과: http://localhost:3001/api/v1/auth/login

const adminUrl = ApiPathBuilder.admin('STATS');
// 결과: http://localhost:3001/api/v1/admin/stats
```

### 2. 파라미터가 있는 경로

```typescript
// 쿼리 파라미터
const url = ApiPathBuilder.buildWithParams('/admin/users', {
  page: 1,
  limit: 10,
  status: 'ACTIVE'
});
// 결과: http://localhost:3001/api/v1/admin/users?page=1&limit=10&status=ACTIVE

// 경로 변수
const url = ApiPathBuilder.buildWithVariables('/admin/users/:id', { id: '123' });
// 결과: http://localhost:3001/api/v1/admin/users/123
```

### 3. 서비스에서 사용

```typescript
export class UserService {
  async getUserById(userId: string): Promise<AdminUser> {
    const url = ApiPathBuilder.buildWithVariables('/admin/users/:id', { id: userId });
    return await this.apiService.get<AdminUser>(url);
  }
  
  async getUsers(filters: UserFilters): Promise<AdminUser[]> {
    const url = ApiPathBuilder.buildWithParams('/admin/users', filters);
    return await this.apiService.get<AdminUser[]>(url);
  }
}
```

## 🔄 API 버전 업그레이드

### v1 → v2 업그레이드 예시

1. **환경 변수만 변경**
   ```bash
   # .env.production
   VITE_API_VERSION=v2
   ```

2. **자동으로 모든 API 호출이 v2로 변경됨**
   - 기존: `http://localhost:3001/api/v1/admin/users`
   - 변경: `http://localhost:3001/api/v2/admin/users`

3. **코드 변경 없음!** ✨

## 🏆 장점

### ✅ 버전 관리
- 환경 변수로 버전 중앙 관리
- 코드 변경 없이 버전 업그레이드
- 환경별 다른 버전 사용 가능

### ✅ 타입 안전성
- TypeScript로 경로 타입 체크
- 잘못된 경로 사용 시 컴파일 에러

### ✅ 유지보수성
- 경로 변경 시 한 곳에서만 수정
- 일관된 API 호출 패턴
- 중복 코드 제거

### ✅ 테스트 용이성
- 환경별 다른 API 엔드포인트 테스트
- Mock API 쉽게 설정

## 🚨 주의사항

1. **환경 변수는 VITE_ 접두사 필수**
2. **API_ROUTES 상수는 경로만 정의** (버전/도메인 제외)
3. **ApiPathBuilder를 통해서만 API 호출**
4. **하드코딩된 URL 사용 금지**

## 🔍 디버깅

```typescript
// 현재 API 설정 확인
console.log(ApiPathBuilder.getConfig());
// {
//   baseUrl: 'http://localhost:3001',
//   version: 'v1',
//   baseApiUrl: 'http://localhost:3001/api/v1',
//   environment: 'development'
// }
```

## 📚 참고 자료

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [REST API Versioning Best Practices](https://restfulapi.net/versioning/)
- [API Versioning Strategies](https://blog.postman.com/api-versioning/)
