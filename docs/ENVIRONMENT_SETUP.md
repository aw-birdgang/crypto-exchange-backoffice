# 환경 설정 가이드

이 문서는 Crypto Exchange Backoffice 프로젝트의 멀티스테이징 환경 설정 방법을 상세히 설명합니다.

## 📋 목차

- [환경 변수 설정](#환경-변수-설정)
- [Docker 설정](#docker-설정)
- [데이터베이스 설정](#데이터베이스-설정)
- [보안 설정](#보안-설정)
- [모니터링 설정](#모니터링-설정)

## 🔧 환경 변수 설정

### 1. API 환경 변수

#### Development 환경 (`config/environments/development.env`)

```bash
# 기본 설정
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=crypto_user
DB_PASSWORD=password
DB_DATABASE=crypto_exchange_dev

# Redis 설정
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT 설정
JWT_SECRET=dev-super-secret-jwt-key-not-for-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# 보안 설정
BCRYPT_ROUNDS=10
API_RATE_LIMIT=1000
API_RATE_WINDOW=900000

# 프론트엔드 설정
FRONTEND_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3001

# 로깅 설정
LOG_LEVEL=debug
LOG_FORMAT=pretty

# CORS 설정
CORS_ORIGIN=http://localhost:3000
```

#### Staging 환경 (`config/environments/staging.env`)

```bash
# 기본 설정
NODE_ENV=staging
PORT=3001
HOST=0.0.0.0

# 데이터베이스 설정 (환경 변수로 주입)
DB_HOST=${DB_HOST}
DB_PORT=3306
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
DB_DATABASE=crypto_exchange_staging

# Redis 설정
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# JWT 설정
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# 보안 설정
BCRYPT_ROUNDS=12
API_RATE_LIMIT=500
API_RATE_WINDOW=900000

# 프론트엔드 설정
FRONTEND_URL=${FRONTEND_URL}
VITE_API_BASE_URL=${VITE_API_BASE_URL}

# 로깅 설정
LOG_LEVEL=info
LOG_FORMAT=json

# CORS 설정
CORS_ORIGIN=${CORS_ORIGIN}

# 모니터링 설정
ENABLE_METRICS=true
METRICS_PORT=9090
```

#### Production 환경 (`config/environments/production.env`)

```bash
# 기본 설정
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# 데이터베이스 설정 (환경 변수로 주입)
DB_HOST=${DB_HOST}
DB_PORT=3306
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
DB_DATABASE=crypto_exchange_prod

# Redis 설정
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# JWT 설정
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# 보안 설정
BCRYPT_ROUNDS=14
API_RATE_LIMIT=100
API_RATE_WINDOW=900000

# 프론트엔드 설정
FRONTEND_URL=${FRONTEND_URL}
VITE_API_BASE_URL=${VITE_API_BASE_URL}

# 로깅 설정
LOG_LEVEL=warn
LOG_FORMAT=json

# CORS 설정
CORS_ORIGIN=${CORS_ORIGIN}

# 모니터링 설정
ENABLE_METRICS=true
METRICS_PORT=9090

# 성능 설정
CLUSTER_MODE=true
MAX_WORKERS=4
```

### 2. Backoffice 환경 변수

#### Development 환경 (`config/environments/backoffice-development.env`)

```bash
VITE_NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_TITLE=Crypto Exchange Backoffice (Dev)
VITE_APP_VERSION=1.0.0-dev
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
VITE_ENABLE_DEVTOOLS=true
VITE_MOCK_API=false
```

#### Staging 환경 (`config/environments/backoffice-staging.env`)

```bash
VITE_NODE_ENV=staging
VITE_API_BASE_URL=${VITE_API_BASE_URL}
VITE_APP_TITLE=Crypto Exchange Backoffice (Staging)
VITE_APP_VERSION=1.0.0-staging
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
VITE_ENABLE_DEVTOOLS=false
VITE_MOCK_API=false
```

#### Production 환경 (`config/environments/backoffice-production.env`)

```bash
VITE_NODE_ENV=production
VITE_API_BASE_URL=${VITE_API_BASE_URL}
VITE_APP_TITLE=Crypto Exchange Backoffice
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
VITE_ENABLE_DEVTOOLS=false
VITE_MOCK_API=false
```

## 🐳 Docker 설정

### 1. Docker Compose 파일

#### Development (`docker-compose.dev.yml`)
- 소스 코드 마운트
- 개발용 데이터베이스 초기화
- 핫 리로드 지원

#### Staging (`docker-compose.staging.yml`)
- 프로덕션 빌드 사용
- 스테이징 전용 데이터베이스
- 모니터링 설정

#### Production (`docker-compose.production.yml`)
- 최적화된 프로덕션 빌드
- Nginx 리버스 프록시
- SSL/TLS 지원
- 로드 밸런싱

### 2. Dockerfile 설정

#### API Dockerfile
```dockerfile
# Multi-stage build for NestJS API
FROM node:18-alpine AS base
# ... 빌드 단계

FROM node:18-alpine AS production
# ... 프로덕션 단계
```

#### Backoffice Dockerfile
```dockerfile
# Multi-stage build for React Backoffice
FROM node:18-alpine AS base
# ... 빌드 단계

FROM nginx:alpine AS production
# ... Nginx 서빙 단계
```

## 🗄️ 데이터베이스 설정

### 1. MySQL 설정

#### 환경별 데이터베이스
- **Development**: `crypto_exchange_dev`
- **Staging**: `crypto_exchange_staging`
- **Production**: `crypto_exchange_prod`

#### 초기화 스크립트
```sql
-- docker/mysql/init/01-init.sql
CREATE DATABASE IF NOT EXISTS crypto_exchange_dev;
CREATE DATABASE IF NOT EXISTS crypto_exchange_staging;
CREATE DATABASE IF NOT EXISTS crypto_exchange_prod;
```

### 2. Redis 설정

#### 환경별 Redis 인스턴스
- **Development**: 포트 6379, 비밀번호 없음
- **Staging**: 포트 6380, 비밀번호 설정
- **Production**: 포트 6381, 강력한 비밀번호

## 🔒 보안 설정

### 1. JWT 설정

#### 환경별 JWT 설정
- **Development**: 24시간 만료, 약한 비밀번호
- **Staging**: 24시간 만료, 강력한 비밀번호
- **Production**: 1시간 만료, 매우 강력한 비밀번호

### 2. 데이터베이스 보안

#### 환경별 보안 수준
- **Development**: 기본 보안
- **Staging**: 중간 보안 (암호화, 접근 제한)
- **Production**: 최고 보안 (강력한 암호화, 네트워크 격리)

### 3. API 보안

#### Rate Limiting
- **Development**: 1000 req/15min
- **Staging**: 500 req/15min
- **Production**: 100 req/15min

#### CORS 설정
- **Development**: `http://localhost:3000`
- **Staging**: 스테이징 도메인
- **Production**: 프로덕션 도메인

## 📊 모니터링 설정

### 1. 로깅 설정

#### 환경별 로그 레벨
- **Development**: `debug` (상세한 로그)
- **Staging**: `info` (중간 로그)
- **Production**: `warn` (최소 로그)

#### 로그 포맷
- **Development**: `pretty` (가독성 좋은 포맷)
- **Staging/Production**: `json` (구조화된 포맷)

### 2. 메트릭스 설정

#### Staging/Production
```bash
ENABLE_METRICS=true
METRICS_PORT=9090
```

### 3. 헬스체크 설정

#### API 헬스체크
- 엔드포인트: `/health`
- 체크 항목: 데이터베이스, Redis, 메모리 사용량

#### Backoffice 헬스체크
- 엔드포인트: `/`
- 체크 항목: 서버 응답, 정적 파일 서빙

## 🚀 배포 전 체크리스트

### Development 환경
- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 초기화 완료
- [ ] 로컬 개발 서버 실행 확인
- [ ] API 엔드포인트 테스트 완료
- [ ] Frontend 빌드 및 실행 확인

### Staging 환경
- [ ] 환경 변수 설정 완료
- [ ] Docker 이미지 빌드 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 헬스체크 통과
- [ ] 성능 테스트 완료
- [ ] 보안 스캔 완료

### Production 환경
- [ ] 환경 변수 설정 완료
- [ ] Docker 이미지 빌드 및 푸시 완료
- [ ] 데이터베이스 백업 완료
- [ ] SSL 인증서 설정 완료
- [ ] 모니터링 설정 완료
- [ ] 로드 밸런서 설정 완료
- [ ] 백업 및 복구 계획 수립 완료

## 🔧 환경 변수 주입 방법

### 1. 로컬 개발
```bash
# 환경 변수 파일 로드
export $(cat config/environments/development.env | grep -v '^#' | xargs)
```

### 2. Docker Compose
```yaml
environment:
  NODE_ENV: ${NODE_ENV}
  DB_HOST: ${DB_HOST}
  # ... 기타 환경 변수
```

### 3. CI/CD (GitHub Actions)
```yaml
env:
  NODE_ENV: ${{ secrets.NODE_ENV }}
  DB_HOST: ${{ secrets.DB_HOST }}
  # ... 기타 환경 변수
```

### 4. Kubernetes
```yaml
env:
- name: NODE_ENV
  valueFrom:
    secretKeyRef:
      name: app-secrets
      key: node-env
```

## 📚 추가 리소스

- [Docker 환경 변수 문서](https://docs.docker.com/compose/environment-variables/)
- [NestJS 설정 문서](https://docs.nestjs.com/techniques/configuration)
- [React 환경 변수 문서](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [MySQL 보안 가이드](https://dev.mysql.com/doc/refman/8.0/en/security.html)
- [Redis 보안 가이드](https://redis.io/docs/management/security/)
