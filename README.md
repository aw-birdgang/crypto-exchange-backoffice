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
- MySQL 8.0 이상 (Docker 없이 로컬 설치 시)

### 설치

```bash
# 의존성 설치
pnpm install

# 모든 프로젝트 빌드
pnpm build
```

### 데이터베이스 관리

#### Docker 환경에서 실행 (권장)

```bash
# 1. 컨테이너 시작 (테이블 자동 생성됨)
docker compose up -d

# 2. 초기 데이터 삽입 (스크립트 사용)
pnpm init:db:script

# 또는 직접 실행
./scripts/init-database.sh

# 데이터베이스 정리
pnpm docker:clean:db
```

#### 로컬 환경에서 실행

```bash
# 데이터베이스 정리
pnpm clean:db

# 초기 데이터 삽입 (Docker 컨테이너 필요)
cd apps/api && DB_HOST=localhost DB_PORT=3306 DB_USERNAME=crypto_user DB_PASSWORD=password DB_DATABASE=crypto_exchange pnpm init:db
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
- **MySQL** - 데이터베이스
- **Redis** - 캐싱 및 세션 관리
- **JWT** - 인증
- **RBAC** - 역할 기반 접근 제어
- **Swagger** - API 문서화
- **Clean Architecture** - 아키텍처 패턴
- **Helmet** - 보안 헤더
- **Rate Limiting** - API 요청 제한

### Frontend (Backoffice)
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **Ant Design** - UI 컴포넌트
- **Zustand** - 상태 관리
- **React Query** - 서버 상태 관리
- **React Router** - 라우팅
- **Cypress** - E2E 테스트
- **권한 기반 UI** - 동적 메뉴 및 컴포넌트 제어

### 개발 도구
- **Jest** - 단위 테스트
- **Vitest** - 프론트엔드 테스트
- **ESLint** - 코드 린팅
- **Prettier** - 코드 포맷팅
- **Docker** - 컨테이너화
- **pnpm** - 패키지 관리

## 🔐 권한 관리 시스템 (RBAC)

### 역할 (Roles)
- **SUPER_ADMIN**: 모든 권한을 가진 최고 관리자
- **ADMIN**: 일반 관리자 (읽기/수정 권한)
- **USER_MANAGER**: 사용자 관리 전담
- **ORDER_MANAGER**: 주문 관리 전담
- **MARKET_MANAGER**: 시장 관리 전담
- **WALLET_MANAGER**: 지갑 관리 전담

### 리소스 (Resources)
- **DASHBOARD**: 대시보드
- **USERS**: 사용자 관리
- **ORDERS**: 주문 관리
- **MARKETS**: 시장 관리
- **WALLETS**: 지갑 관리
- **SETTINGS**: 시스템 설정
- **REPORTS**: 리포트
- **AUDIT_LOGS**: 감사 로그

### 권한 (Permissions)
- **CREATE**: 생성 권한
- **READ**: 조회 권한
- **UPDATE**: 수정 권한
- **DELETE**: 삭제 권한
- **MANAGE**: 모든 권한 (CRUD 포함)

### 권한 검증 방식
1. **백엔드**: JWT 토큰 기반 인증 + 권한 가드
2. **프론트엔드**: 권한 기반 컴포넌트 렌더링
3. **메뉴 접근**: 역할별 메뉴 표시/숨김
4. **API 엔드포인트**: 세부 권한 검증

### 자동 초기화 데이터
Docker 컨테이너 시작 시 SQL 스크립트에 의해 자동으로 다음 데이터가 생성됩니다:
- **5개 기본 역할**: SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT, AUDITOR
- **5개 관리자 계정**: 각 역할별 테스트 계정
- **역할별 권한**: 리소스별 세부 권한 설정
- **중복 방지**: INSERT IGNORE로 기존 데이터 보호

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

# 백엔드 테스트
pnpm test:api
pnpm test:api:cov      # 커버리지 포함
pnpm test:api:e2e      # E2E 테스트

# 프론트엔드 테스트
pnpm test:backoffice
pnpm test:backoffice:coverage  # 커버리지 포함
pnpm test:backoffice:e2e       # E2E 테스트 (Cypress)
pnpm test:backoffice:e2e:open  # E2E 테스트 UI
```

## 📦 빌드

```bash
# 프로덕션 빌드
pnpm build

# 특정 프로젝트 빌드
pnpm build:api
pnpm build:backoffice
pnpm build:shared
```

## 🔧 최적화 기능

### 성능 최적화
- **Redis 캐싱**: 자주 사용되는 데이터 캐싱으로 응답 속도 향상
- **데이터베이스 인덱스**: 쿼리 성능 최적화를 위한 인덱스 추가
- **React Query**: 서버 상태 캐싱 및 동기화
- **코드 스플리팅**: 번들 크기 최적화
- **이미지 지연 로딩**: 페이지 로딩 속도 향상

### 보안 강화
- **Rate Limiting**: API 요청 제한으로 DDoS 방지
- **Helmet**: 보안 헤더 자동 설정
- **입력 검증**: XSS, SQL Injection 방지
- **CORS 설정**: 안전한 크로스 오리진 요청
- **JWT 토큰**: 안전한 인증 및 인가

### 모니터링 및 로깅
- **구조화된 로깅**: JSON 형태의 로그로 분석 용이
- **성능 모니터링**: API 응답 시간 및 메모리 사용량 추적
- **헬스체크**: Kubernetes 호환 헬스체크 엔드포인트
- **에러 추적**: 자동 에러 수집 및 알림
- **사용자 분석**: 프론트엔드 사용자 행동 분석

## 🏥 헬스체크

애플리케이션 상태를 확인할 수 있는 엔드포인트:

```bash
# 기본 헬스체크
curl http://localhost:3001/health

# 상세 헬스체크 (데이터베이스, 캐시 상태 포함)
curl http://localhost:3001/health/detailed

# Kubernetes Readiness Probe
curl http://localhost:3001/health/ready

# Kubernetes Liveness Probe
curl http://localhost:3001/health/live
```

## 📊 모니터링

### 백엔드 모니터링
- **구조화된 로그**: JSON 형태로 출력되어 ELK Stack 등에서 분석 가능
- **성능 메트릭**: API 응답 시간, 데이터베이스 쿼리 시간 추적
- **에러 추적**: 자동 에러 수집 및 스택 트레이스 기록
- **메모리 사용량**: 힙 메모리 사용량 모니터링

### 프론트엔드 모니터링
- **사용자 행동 분석**: 페이지 뷰, 클릭 이벤트 추적
- **성능 메트릭**: 페이지 로딩 시간, API 호출 시간 측정
- **에러 추적**: JavaScript 에러 자동 수집
- **세션 추적**: 사용자 세션 시작/종료 추적

## 🚀 배포

### Docker를 사용한 배포

```bash
# 개발 환경
docker-compose -f docker-compose.dev.yml up -d

# 프로덕션 환경
docker-compose up -d
```

### 환경 변수 설정

#### API 서버 (.env)
```env
# 데이터베이스
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your-secure-password
DB_DATABASE=crypto_exchange

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# 보안
BCRYPT_ROUNDS=12
API_RATE_LIMIT=100
API_RATE_WINDOW=900000

# 서버
PORT=3001
NODE_ENV=production
```

#### 프론트엔드 (.env)
```env
VITE_API_BASE_URL=http://localhost:3001
```

## 🔍 디버깅

### 로그 확인
```bash
# Docker 로그
docker-compose logs -f api
docker-compose logs -f backoffice

# 개발 서버 로그
pnpm dev:api
pnpm dev:backoffice
```

### 테스트 디버깅
```bash
# 단위 테스트 디버깅
pnpm test:api:debug

# E2E 테스트 디버깅
pnpm test:backoffice:e2e:open
```

## 📈 성능 튜닝

### 데이터베이스 최적화
- 인덱스 추가로 쿼리 성능 향상
- 연결 풀 설정으로 동시 연결 최적화
- 쿼리 최적화 및 N+1 문제 해결

### 캐싱 전략
- Redis를 사용한 애플리케이션 레벨 캐싱
- React Query를 사용한 클라이언트 사이드 캐싱
- CDN을 사용한 정적 자산 캐싱

### 메모리 최적화
- 불필요한 리렌더링 방지
- 메모리 누수 방지
- 가비지 컬렉션 최적화

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면 다음을 통해 연락해주세요:

- 이슈 트래커: [GitHub Issues](https://github.com/your-username/crypto-exchange-backoffice/issues)
- 이메일: support@crypto-exchange.com
- 문서: [API Documentation](http://localhost:3001/api-docs)
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
- **MySQL**: 메인 데이터베이스
- **Redis**: 캐싱 및 세션 관리
- **API**: NestJS 백엔드 서버
- **Backoffice**: React 프론트엔드 (Nginx)

### 포트 매핑
- **API**: http://localhost:3001
- **Backoffice**: http://localhost:3000
- **MySQL**: localhost:3306
- **Redis**: localhost:6379

### 환경 변수
```bash
# API 서버
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=crypto_user
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
