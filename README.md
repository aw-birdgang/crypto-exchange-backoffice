# 🏦 Crypto Exchange Backoffice

암호화폐 거래소의 관리자용 백오피스 시스템입니다. Clean Architecture 원칙을 기반으로 설계되어 유지보수성, 확장성, 테스트 가능성을 보장합니다.

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [아키텍처](#아키텍처)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [빌드 및 실행](#빌드-및-실행)
- [개발 환경 설정](#개발-환경-설정)
- [API 문서](#api-문서)
- [테스트](#테스트)
- [배포](#배포)
- [문서](#문서)
- [기여 가이드](#기여-가이드)

## 🎯 프로젝트 개요

### 주요 기능
- **사용자 관리**: 어드민 사용자 승인, 역할 관리, 권한 제어
- **인증/인가**: JWT 기반 인증, 역할 기반 접근 제어 (RBAC)
- **대시보드**: 실시간 통계 및 모니터링
- **지갑 관리**: 거래 내역 조회 및 관리
- **고객 지원**: 고객 문의 및 지원 관리

### 특징
- **Clean Architecture**: 계층별 명확한 책임 분리
- **Monorepo**: pnpm workspace를 통한 효율적인 패키지 관리
- **TypeScript**: 정적 타입 검사로 안정성 확보
- **Docker**: 컨테이너화를 통한 일관된 개발/배포 환경
- **테스트**: 단위, 통합, E2E 테스트 완비

## 🏗️ 아키텍처

### 전체 아키텍처
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Pages     │ │ Components  │ │    Hooks    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (NestJS)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Controllers │ │  Services   │ │  Entities   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │    MySQL    │ │    Redis    │ │   Cache     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Clean Architecture 계층
- **Presentation Layer**: React 컴포넌트, 페이지, 훅
- **Application Layer**: Use Case, 서비스, 상태 관리
- **Domain Layer**: 엔티티, 인터페이스, 비즈니스 로직
- **Infrastructure Layer**: API 서비스, 데이터베이스, 외부 서비스

## 🛠️ 기술 스택

### Frontend
- **React 18**: UI 라이브러리
- **TypeScript**: 정적 타입 검사
- **Vite**: 빌드 도구 및 개발 서버
- **TanStack Query**: 서버 상태 관리
- **Zustand**: 클라이언트 상태 관리
- **Ant Design**: UI 컴포넌트 라이브러리
- **React Hook Form**: 폼 관리
- **React Router**: 라우팅

### Backend
- **NestJS**: Node.js 프레임워크
- **TypeScript**: 정적 타입 검사
- **TypeORM**: ORM
- **MySQL**: 관계형 데이터베이스
- **Redis**: 캐싱 및 세션 관리
- **JWT**: 인증 토큰
- **Swagger**: API 문서화
- **Passport**: 인증 전략

### 개발 도구
- **pnpm**: 패키지 매니저
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **Vitest**: 단위 테스트
- **Cypress**: E2E 테스트
- **Docker**: 컨테이너화

## 📁 프로젝트 구조

```
crypto-exchange-backoffice/
├── apps/                           # 애플리케이션
│   ├── api/                        # NestJS API 서버
│   │   ├── src/
│   │   │   ├── common/             # 공통 모듈
│   │   │   ├── config/             # 설정
│   │   │   ├── features/           # 기능별 모듈
│   │   │   │   └── auth/           # 인증 모듈
│   │   │   │       ├── application/
│   │   │   │       ├── domain/
│   │   │   │       ├── infrastructure/
│   │   │   │       └── presentation/
│   │   │   └── scripts/            # 데이터베이스 스크립트
│   │   ├── docs/                   # API 문서
│   │   └── test/                   # E2E 테스트
│   └── backoffice/                 # React 프론트엔드
│       ├── src/
│       │   ├── features/           # 기능별 모듈
│       │   │   ├── auth/           # 인증
│       │   │   ├── users/          # 사용자 관리
│       │   │   ├── wallet/         # 지갑 관리
│       │   │   └── customer/       # 고객 지원
│       │   ├── shared/             # 공통 모듈
│       │   │   ├── components/     # 공통 컴포넌트
│       │   │   ├── hooks/          # 공통 훅
│       │   │   ├── services/       # 공통 서비스
│       │   │   └── utils/          # 유틸리티
│       │   └── config/             # 설정
│       └── docs/                   # 프론트엔드 문서
├── packages/                       # 공유 패키지
│   └── shared/                     # 공통 타입 및 유틸리티
├── docker/                         # Docker 설정
├── docs/                           # 프로젝트 문서
└── scripts/                        # 유틸리티 스크립트
```

## 🚀 빌드 및 실행

### 사전 요구사항
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose

### 설치
```bash
# 의존성 설치
pnpm install
```

### 개발 환경 실행

#### 1. Docker로 전체 환경 실행
```bash
# 개발 환경 실행
pnpm docker:dev

# 데이터베이스 초기화
pnpm docker:dev:init

# 로그 확인
pnpm docker:dev:logs

# 환경 종료
pnpm docker:dev:down
```

#### 2. 로컬 개발 환경 실행
```bash
# API 서버 실행
pnpm dev:api

# 프론트엔드 실행
pnpm dev:backoffice

# 모든 서비스 동시 실행
pnpm dev
```

### 프로덕션 빌드
```bash
# 전체 빌드
pnpm build

# 개별 빌드
pnpm build:api
pnpm build:backoffice
pnpm build:shared
```

### 프로덕션 실행
```bash
# Docker로 프로덕션 환경 실행
pnpm docker:prod

# 로그 확인
pnpm docker:prod:logs
```

## ⚙️ 개발 환경 설정

### 환경 변수 설정

#### API 서버 (.env)
```bash
# apps/api/.env 파일 생성
cp apps/api/env.example apps/api/.env
```

주요 환경 변수:
```env
# 데이터베이스
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=crypto_user
DB_PASSWORD=password
DB_DATABASE=crypto_exchange

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# 서버 설정
PORT=3001
NODE_ENV=development
```

#### 프론트엔드 (.env)
```bash
# apps/backoffice/.env 파일 생성
VITE_API_BASE_URL=http://localhost:3001
```

### 데이터베이스 초기화
```bash
# 로컬 데이터베이스 초기화
pnpm init:db:local

# Docker 데이터베이스 초기화
pnpm init:db:docker

# 데이터베이스 리셋
pnpm reset:db
```

### 개발 도구 설정
```bash
# 코드 포맷팅
pnpm format

# 린팅
pnpm lint

# 린팅 자동 수정
pnpm lint:fix
```

## 📚 API 문서

### Swagger UI
- **개발 환경**: http://localhost:3001/api-docs

### API 버전 관리
- **현재 버전**: v1
- **버전 관리**: URL 기반 (`/api/v1/`)
- **문서**: [API 버전 관리 가이드](./apps/api/docs/api-version-decorator-guide.md)

### 주요 엔드포인트
- **인증**: `/api/v1/auth/*`
- **사용자 관리**: `/api/v1/admin/*`
- **헬스 체크**: `/api/v1/health`

## 🧪 테스트

### 테스트 실행
```bash
# 전체 테스트
pnpm test

# 개별 테스트
pnpm test:api          # API 단위 테스트
pnpm test:backoffice   # 프론트엔드 단위 테스트

# E2E 테스트
pnpm test:e2e

# 테스트 커버리지
pnpm test:cov
```

### 테스트 구조
- **단위 테스트**: `*.spec.ts`, `*.test.ts`
- **통합 테스트**: `*.integration.test.ts`
- **E2E 테스트**: `cypress/e2e/*.cy.ts`

## 🚀 멀티스테이징 배포

### 환경 구성
- **Development**: 로컬 개발 환경 (포트: API 3001, Backoffice 3000)
- **Staging**: 스테이징 환경 (포트: API 3002, Backoffice 3003)
- **Production**: 프로덕션 환경 (포트: API 3004, Backoffice 3005)

### 환경별 배포

#### Development 환경
```bash
# 개발 환경 빌드
pnpm build:dev

# 개발 환경 배포
pnpm deploy:dev

# 개발 환경 상태 확인
pnpm deploy:dev:status

# 개발 환경 로그 확인
pnpm deploy:dev:logs
```

#### Staging 환경
```bash
# 스테이징 환경 빌드
pnpm build:staging

# 스테이징 환경 배포
pnpm deploy:staging

# 스테이징 환경 상태 확인
pnpm deploy:staging:status

# 스테이징 환경 로그 확인
pnpm deploy:staging:logs
```

#### Production 환경
```bash
# 프로덕션 환경 빌드
pnpm build:prod

# 프로덕션 환경 배포
pnpm deploy:prod

# 프로덕션 환경 상태 확인
pnpm deploy:prod:status

# 프로덕션 환경 로그 확인
pnpm deploy:prod:logs
```

### Docker Compose 배포

#### Development
```bash
# 개발 환경 시작
docker compose -f docker-compose.dev.yml up -d

# 개발 환경 중지
docker compose -f docker-compose.dev.yml down
```

#### Staging
```bash
# 스테이징 환경 시작
docker compose -f docker-compose.staging.yml up -d

# 스테이징 환경 중지
docker compose -f docker-compose.staging.yml down
```

#### Production
```bash
# 프로덕션 환경 시작
docker compose -f docker-compose.production.yml up -d

# 프로덕션 환경 중지
docker compose -f docker-compose.production.yml down
```

### 헬스체크
```bash
# 환경별 헬스체크
pnpm health:dev
pnpm health:staging
pnpm health:prod

# 또는 스크립트 직접 실행
./scripts/health-check.sh dev
./scripts/health-check.sh staging
./scripts/health-check.sh prod
```

### 배포 가이드
- [상세 배포 가이드](./docs/DEPLOYMENT.md)
- [환경 설정 가이드](./docs/ENVIRONMENT_SETUP.md)

## 📖 문서

### 아키텍처 문서
- [API 아키텍처 개요](./apps/api/docs/architecture-overview.md)
- [프론트엔드 아키텍처](./apps/backoffice/docs/architecture-overview.md)
- [Clean Architecture 가이드](./apps/backoffice/CLEAN_ARCHITECTURE.md)

### 개발 가이드
- [상태 관리 가이드](./apps/backoffice/docs/state-management.md)
- [Use Case 패턴 가이드](./apps/backoffice/docs/use-case-pattern.md)
- [API 버전 관리](./apps/api/docs/api-version-decorator-guide.md)

### API 문서
- [API 문서](./apps/api/docs/api-documentation.md)
- [Swagger UI](http://localhost:3001/api/docs)

### 데이터베이스
- [데이터베이스 ERD](./puml/erd/database_erd.puml)
- [권한 시스템 분석](./docs/role_permission_analysis.txt)

## 🤝 기여 가이드

### 개발 워크플로우
1. 이슈 생성
2. 브랜치 생성 (`feature/issue-number`)
3. 개발 및 테스트
4. Pull Request 생성
5. 코드 리뷰
6. 머지

### 코딩 스타일
- **TypeScript**: strict 모드 사용
- **ESLint**: 프로젝트 설정 따르기
- **Prettier**: 자동 포맷팅 적용
- **커밋 메시지**: Conventional Commits 사용

### 브랜치 전략
- `main`: 프로덕션 브랜치
- `dev`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치
- `hotfix/*`: 긴급 수정 브랜치

## 📊 모니터링

### 헬스 체크
- **API**: `GET /api/v1/health`
- **상세 헬스**: `GET /api/v1/health/detailed`

### 로깅
- **구조화된 로깅**: JSON 형식
- **로그 레벨**: ERROR, WARN, INFO, DEBUG, VERBOSE
- **요청 추적**: Request ID 기반

### 성능 모니터링
- **Use Case 실행 시간**: 자동 측정
- **API 응답 시간**: 미들웨어 기반
- **데이터베이스 쿼리**: TypeORM 로깅

## 🔒 보안

### 인증/인가
- **JWT 토큰**: 안전한 인증
- **RBAC**: 역할 기반 접근 제어
- **권한 검증**: 미들웨어 기반

### 데이터 보안
- **비밀번호 해싱**: bcrypt
- **입력 검증**: class-validator
- **SQL 인젝션 방지**: TypeORM

### API 보안
- **Rate Limiting**: 요청 제한
- **CORS**: 적절한 설정
- **Helmet**: 보안 헤더

## 📈 성능 최적화

### 프론트엔드
- **코드 분할**: Lazy Loading
- **캐싱**: React Query, Zustand
- **가상화**: 대용량 리스트
- **메모이제이션**: React.memo, useMemo

### 백엔드
- **데이터베이스 최적화**: 인덱싱, 쿼리 최적화
- **캐싱**: Redis 활용
- **연결 풀링**: 효율적인 리소스 사용

## 🐛 문제 해결

### 일반적인 문제
1. **포트 충돌**: 3000, 3001, 3306, 6379 포트 확인
2. **데이터베이스 연결**: MySQL 서비스 상태 확인
3. **Redis 연결**: Redis 서비스 상태 확인
4. **환경 변수**: .env 파일 설정 확인

### 디버깅
```bash
# API 로그 확인
pnpm docker:dev:logs api

# 데이터베이스 로그 확인
pnpm docker:dev:logs mysql

# Redis 로그 확인
pnpm docker:dev:logs redis
```
