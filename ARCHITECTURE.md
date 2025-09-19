# 아키텍처 문서

## 📋 목차
- [전체 아키텍처](#전체-아키텍처)
- [백엔드 아키텍처](#백엔드-아키텍처)
- [프론트엔드 아키텍처](#프론트엔드-아키텍처)
- [데이터베이스 설계](#데이터베이스-설계)
- [보안 아키텍처](#보안-아키텍처)
- [모니터링 아키텍처](#모니터링-아키텍처)

## 전체 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (NestJS)      │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN           │    │   Redis Cache   │    │   File Storage  │
│   (Static)      │    │   (Session)     │    │   (Images)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 백엔드 아키텍처

### Clean Architecture 패턴

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Controllers │  │   Guards    │  │ Middleware  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Services   │  │   DTOs      │  │  Use Cases  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Entities   │  │ Interfaces  │  │ Value Objs  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Repositories│  │   External  │  │   Database  │        │
│  │             │  │  Services   │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

#### 1. 인증 및 인가
- **JWT 토큰**: Access Token + Refresh Token 방식
- **RBAC**: 역할 기반 접근 제어
- **Rate Limiting**: API 요청 제한
- **Password Hashing**: bcrypt를 사용한 비밀번호 암호화

#### 2. 캐싱 전략
- **Redis**: 세션 및 자주 사용되는 데이터 캐싱
- **Application Cache**: 메모리 기반 캐싱
- **Database Query Cache**: 쿼리 결과 캐싱

#### 3. 보안
- **Helmet**: 보안 헤더 설정
- **CORS**: 크로스 오리진 요청 제어
- **Input Validation**: 입력 데이터 검증
- **SQL Injection Prevention**: ORM을 통한 SQL 인젝션 방지

## 프론트엔드 아키텍처

### 컴포넌트 구조

```
src/
├── features/                 # 기능별 모듈
│   ├── auth/                # 인증 관련
│   │   ├── application/     # 비즈니스 로직
│   │   │   ├── hooks/       # 커스텀 훅
│   │   │   ├── services/    # API 서비스
│   │   │   └── stores/      # 상태 관리
│   │   └── presentation/    # UI 컴포넌트
│   │       ├── pages/       # 페이지 컴포넌트
│   │       └── components/  # 공통 컴포넌트
│   └── dashboard/           # 대시보드 관련
├── shared/                  # 공통 모듈
│   ├── components/          # 재사용 가능한 컴포넌트
│   ├── hooks/              # 공통 훅
│   ├── services/           # 공통 서비스
│   └── utils/              # 유틸리티 함수
└── config/                 # 설정 파일
```

### 상태 관리

#### 1. Zustand Store
- **Auth Store**: 사용자 인증 상태
- **Permission Store**: 권한 및 역할 상태
- **UI Store**: UI 상태 (로딩, 모달 등)

#### 2. React Query
- **Server State**: 서버 상태 캐싱 및 동기화
- **Background Updates**: 백그라운드 데이터 업데이트
- **Optimistic Updates**: 낙관적 업데이트

### 성능 최적화

#### 1. 코드 스플리팅
- **Route-based Splitting**: 라우트별 코드 분할
- **Component Lazy Loading**: 컴포넌트 지연 로딩
- **Dynamic Imports**: 동적 임포트

#### 2. 메모이제이션
- **React.memo**: 컴포넌트 메모이제이션
- **useMemo**: 값 메모이제이션
- **useCallback**: 함수 메모이제이션

## 데이터베이스 설계

### ERD (Entity Relationship Diagram)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   admin_users   │    │      roles      │    │ role_permissions│
│                 │    │                 │    │                 │
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ email (UNIQUE)  │    │ name (UNIQUE)   │    │ role_id (FK)    │
│ username        │    │ description     │    │ resource        │
│ password        │    │ is_active       │    │ permissions     │
│ first_name      │    │ created_at      │    │ created_at      │
│ last_name       │    │ updated_at      │    │ updated_at      │
│ admin_role      │    └─────────────────┘    └─────────────────┘
│ permissions     │
│ is_active       │
│ last_login_at   │
│ created_at      │
│ updated_at      │
│ created_by      │
│ updated_by      │
└─────────────────┘
```

### 인덱스 전략

#### 1. Primary Indexes
- `admin_users.id` (Primary Key)
- `roles.id` (Primary Key)
- `role_permissions.id` (Primary Key)

#### 2. Unique Indexes
- `admin_users.email` (Unique)
- `roles.name` (Unique)

#### 3. Performance Indexes
- `admin_users.admin_role` (Role-based queries)
- `admin_users.is_active` (Active user queries)
- `role_permissions.role` (Permission queries)
- `role_permissions.resource` (Resource-based queries)

## 보안 아키텍처

### 1. 인증 흐름

```
1. 사용자 로그인 요청
   ↓
2. 이메일/비밀번호 검증
   ↓
3. bcrypt로 비밀번호 확인
   ↓
4. JWT Access Token 생성 (24시간)
   ↓
5. JWT Refresh Token 생성 (7일)
   ↓
6. 토큰을 클라이언트에 반환
```

### 2. 인가 흐름

```
1. API 요청에 JWT 토큰 포함
   ↓
2. JWT 토큰 검증
   ↓
3. 사용자 정보 추출
   ↓
4. 권한 확인 (RBAC)
   ↓
5. 요청 처리 또는 403 에러
```

### 3. 보안 계층

```
┌─────────────────────────────────────────┐
│            Application Layer            │
│  ┌─────────────────────────────────────┐│
│  │         Rate Limiting               ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │         CORS Protection             ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │         JWT Authentication          ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │         RBAC Authorization          ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │         Input Validation            ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

## 모니터링 아키텍처

### 1. 로깅 시스템

#### 백엔드 로깅
- **구조화된 로그**: JSON 형태로 출력
- **로그 레벨**: ERROR, WARN, INFO, DEBUG, VERBOSE
- **컨텍스트 정보**: 사용자 ID, 요청 ID, 작업 유형
- **성능 메트릭**: 응답 시간, 메모리 사용량

#### 프론트엔드 로깅
- **사용자 행동**: 페이지 뷰, 클릭 이벤트
- **에러 추적**: JavaScript 에러 자동 수집
- **성능 메트릭**: 페이지 로딩 시간, API 호출 시간

### 2. 헬스체크

#### Kubernetes 호환
- **Liveness Probe**: `/health/live`
- **Readiness Probe**: `/health/ready`
- **Startup Probe**: `/health`

#### 모니터링 항목
- **데이터베이스 연결**: PostgreSQL 상태
- **캐시 연결**: Redis 상태
- **메모리 사용량**: 힙 메모리 사용률
- **응답 시간**: API 평균 응답 시간

### 3. 성능 모니터링

#### 백엔드 메트릭
- **API 응답 시간**: 각 엔드포인트별 응답 시간
- **데이터베이스 쿼리 시간**: 쿼리 성능 추적
- **메모리 사용량**: 힙 메모리 사용률
- **에러율**: 4xx, 5xx 에러 비율

#### 프론트엔드 메트릭
- **페이지 로딩 시간**: First Contentful Paint, Largest Contentful Paint
- **API 호출 시간**: 네트워크 요청 응답 시간
- **번들 크기**: JavaScript, CSS 파일 크기
- **사용자 경험**: Core Web Vitals

## 확장성 고려사항

### 1. 수평적 확장
- **로드 밸런서**: Nginx 또는 AWS ALB
- **마이크로서비스**: 기능별 서비스 분리
- **데이터베이스 샤딩**: 사용자별 데이터 분산

### 2. 수직적 확장
- **메모리 최적화**: 불필요한 객체 제거
- **CPU 최적화**: 비동기 처리 및 워커 스레드
- **I/O 최적화**: 연결 풀링 및 캐싱

### 3. 데이터베이스 확장
- **읽기 전용 복제본**: 읽기 쿼리 분산
- **파티셔닝**: 테이블별 데이터 분할
- **인덱스 최적화**: 쿼리 성능 향상

## 배포 아키텍처

### 1. 컨테이너화
- **Docker**: 애플리케이션 컨테이너화
- **Docker Compose**: 로컬 개발 환경
- **Kubernetes**: 프로덕션 오케스트레이션

### 2. CI/CD 파이프라인
- **GitHub Actions**: 자동화된 빌드 및 배포
- **테스트 자동화**: 단위 테스트, 통합 테스트, E2E 테스트
- **코드 품질**: ESLint, Prettier, TypeScript 검사

### 3. 인프라스트럭처
- **클라우드**: AWS, GCP, 또는 Azure
- **CDN**: 정적 자산 전역 배포
- **모니터링**: CloudWatch, DataDog, 또는 New Relic
