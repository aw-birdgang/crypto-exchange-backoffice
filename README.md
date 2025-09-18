# Crypto Exchange Backoffice

암호화폐 거래소 백오피스 시스템입니다. pnpm 기반 monorepo 구조로 NestJS API와 React frontend를 포함합니다.

## 🏗️ 프로젝트 구조

```
crypto-exchange-backoffice/
├── apps/
│   ├── api/                    # NestJS API 서버
│   │   ├── src/
│   │   │   ├── core/           # 핵심 비즈니스 로직
│   │   │   ├── features/       # Feature-based 모듈
│   │   │   │   ├── auth/       # 인증 모듈
│   │   │   │   ├── user/       # 사용자 관리
│   │   │   │   ├── exchange/   # 거래소 기능
│   │   │   │   ├── wallet/     # 지갑 관리
│   │   │   │   ├── order/      # 주문 관리
│   │   │   │   └── market/     # 시장 관리
│   │   │   └── shared/         # 공통 유틸리티
│   │   └── package.json
│   └── backoffice/             # React 백오피스
│       ├── src/
│       │   ├── core/           # 핵심 비즈니스 로직
│       │   ├── features/       # Feature-based 모듈
│       │   └── shared/         # 공통 컴포넌트
│       └── package.json
├── packages/
│   └── shared/                 # 공통 타입 및 유틸리티
└── package.json
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- pnpm 8.0.0 이상
- Docker & Docker Compose (권장)
- PostgreSQL 13 이상 (Docker 없이 로컬 설치 시)

### 설치

```bash
# 의존성 설치
pnpm install

# 모든 프로젝트 빌드
pnpm build
```

### 🐳 Docker로 실행 (권장)

#### 개발 환경
```bash
# 데이터베이스와 Redis만 실행 (개발용)
pnpm docker:dev

# 애플리케이션 개발 서버 시작
pnpm dev

# 개발 환경 정리
pnpm docker:dev:down
```

#### 프로덕션 환경
```bash
# 모든 서비스 실행 (프로덕션용)
pnpm docker:prod

# 로그 확인
pnpm docker:prod:logs

# 서비스 중지
pnpm docker:prod:down
```

### 💻 로컬 개발 환경

```bash
# 개발 서버 시작
pnpm dev

# 개별 프로젝트 실행
cd apps/api && pnpm dev
cd apps/backoffice && pnpm dev
```

## 🛠️ 기술 스택

### Backend (API)
- **NestJS** - Node.js 프레임워크
- **TypeORM** - ORM
- **PostgreSQL** - 데이터베이스
- **JWT** - 인증
- **Swagger** - API 문서화
- **Clean Architecture** - 아키텍처 패턴

### Frontend (Backoffice)
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **Ant Design** - UI 컴포넌트
- **Zustand** - 상태 관리
- **React Query** - 서버 상태 관리
- **React Router** - 라우팅

## 📁 Clean Architecture

### Domain Layer
- **Entities**: 핵심 비즈니스 객체
- **Value Objects**: 불변 객체
- **Repository Interfaces**: 데이터 접근 인터페이스

### Application Layer
- **Use Cases**: 비즈니스 로직
- **Services**: 애플리케이션 서비스
- **DTOs**: 데이터 전송 객체

### Infrastructure Layer
- **Repositories**: 데이터 접근 구현
- **External Services**: 외부 서비스 연동
- **Database**: 데이터베이스 설정

### Presentation Layer
- **Controllers**: API 엔드포인트
- **Middlewares**: 미들웨어
- **Guards**: 인증/인가

## 🔧 개발 가이드

### Feature 추가하기

1. **API Feature 추가**
   ```bash
   mkdir -p apps/api/src/features/new-feature/{domain,application,infrastructure,presentation}
   ```

2. **Frontend Feature 추가**
   ```bash
   mkdir -p apps/backoffice/src/features/new-feature/{domain,application,presentation}
   ```

### 코드 스타일

- ESLint + Prettier 사용
- TypeScript strict 모드
- Clean Architecture 원칙 준수
- Feature-based 모듈 구조

### 환경 변수

API 서버 환경 변수 설정:
```bash
cp apps/api/env.example apps/api/.env
```

백오피스 환경 변수 설정:
```bash
# apps/backoffice/.env
VITE_API_BASE_URL=http://localhost:3001
```

## 📚 API 문서

개발 서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:
- http://localhost:3001/api-docs

## 🧪 테스트

```bash
# 모든 테스트 실행
pnpm test

# 특정 프로젝트 테스트
cd apps/api && pnpm test
cd apps/backoffice && pnpm test
```

## 📦 빌드

```bash
# 프로덕션 빌드
pnpm build

# 특정 프로젝트 빌드
cd apps/api && pnpm build
cd apps/backoffice && pnpm build

# Docker 이미지 빌드
pnpm docker:build
```

## 🐳 Docker 스크립트

```bash
# 개발 환경
pnpm docker:dev              # 데이터베이스와 Redis 시작
pnpm docker:dev:down         # 개발 환경 중지
pnpm docker:dev:logs         # 개발 환경 로그 확인

# 프로덕션 환경
pnpm docker:prod             # 전체 스택 시작
pnpm docker:prod:down        # 프로덕션 환경 중지
pnpm docker:prod:logs        # 프로덕션 환경 로그 확인

# 유틸리티
pnpm docker:build            # Docker 이미지 빌드
pnpm docker:clean            # 모든 컨테이너와 이미지 정리
```

## 🐳 Docker

### 서비스 구성
- **PostgreSQL**: 메인 데이터베이스
- **Redis**: 캐싱 및 세션 관리
- **API**: NestJS 백엔드 서버
- **Backoffice**: React 프론트엔드 (Nginx)
- **pgAdmin**: 데이터베이스 관리 도구 (개발용)

### 포트 매핑
- **API**: http://localhost:3001
- **Backoffice**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **pgAdmin**: http://localhost:5050 (개발용)

### 환경 변수
```bash
# API 서버
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=crypto_exchange
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Backoffice
VITE_API_BASE_URL=http://localhost:3001
```

## 🚀 배포

각 애플리케이션은 독립적으로 배포할 수 있습니다:

- **API**: Docker 컨테이너 또는 클라우드 서비스
- **Backoffice**: 정적 파일 호스팅 (Vercel, Netlify 등)
- **Docker Compose**: 전체 스택을 한 번에 배포

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
