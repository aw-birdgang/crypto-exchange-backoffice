# 🚀 Development Guide

## 📋 프로젝트 구조

```
crypto-exchange-backoffice/
├── apps/
│   ├── api/          # NestJS API 서버
│   └── backoffice/   # React Frontend
├── packages/
│   └── shared/       # 공유 타입 및 유틸리티
└── scripts/          # 실행 스크립트
```

## 🎯 일관성 있는 개발 환경

**모든 환경에서 동일한 구조:**
- **API 서버**: Docker Compose로 실행
- **Backoffice**: 개별 실행 (pnpm dev)
- **데이터베이스**: Docker Compose로 실행

## 🛠️ 환경별 실행 방법

### 1. Development 환경

```bash
# 방법 1: 통합 실행 (권장)
./scripts/start-dev.sh dev

# 방법 2: 개별 실행
# API 서버 (Docker)
docker compose -f docker-compose.dev.yml up -d

# Backoffice (개별)
pnpm dev:backoffice:dev
```

**접속 정보:**
- API 서버: http://localhost:3001
- API 문서: http://localhost:3001/api-docs
- Backoffice: http://localhost:3000

### 2. Staging 환경

```bash
# 방법 1: 통합 실행 (권장)
./scripts/start-dev.sh staging

# 방법 2: 개별 실행
# API 서버 (Docker)
docker compose -f docker-compose.staging.yml up -d

# Backoffice (개별)
pnpm dev:backoffice:staging
```

**접속 정보:**
- API 서버: http://localhost:3002
- API 문서: http://localhost:3002/api-docs-staging
- Backoffice: http://localhost:3000

### 3. Production 환경

```bash
# 방법 1: 통합 실행 (권장)
./scripts/start-dev.sh prod

# 방법 2: 개별 실행
# API 서버 (Docker)
docker compose -f docker-compose.production.yml up -d

# Backoffice (개별)
pnpm dev:backoffice:prod
```

**접속 정보:**
- API 서버: http://localhost:3004
- API 문서: http://localhost:3004/api-docs-prod
- Backoffice: http://localhost:3000

## 📦 패키지 관리

### 의존성 설치
```bash
# 전체 프로젝트
pnpm install

# API만
pnpm --filter @crypto-exchange/api install

# Backoffice만
pnpm --filter @crypto-exchange/backoffice install

# Shared만
pnpm --filter @crypto-exchange/shared install
```

### 빌드
```bash
# 전체 빌드
pnpm build

# API만
pnpm build:api

# Backoffice만
pnpm build:backoffice

# Shared만
pnpm build:shared
```

## 🐳 Docker 관리

### API 서버만 실행
```bash
# Development
docker compose -f docker-compose.dev.yml up -d

# Staging
docker compose -f docker-compose.staging.yml up -d

# Production
docker compose -f docker-compose.production.yml up -d
```

### Docker 정리
```bash
# 모든 컨테이너 중지
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.staging.yml down
docker compose -f docker-compose.production.yml down

# 볼륨까지 삭제
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.staging.yml down -v
docker compose -f docker-compose.production.yml down -v
```

## 🗄️ 데이터베이스 관리

### 데이터베이스 초기화
```bash
# Development
pnpm init:db:local

# Docker 환경
pnpm init:db:docker
```

### 데이터베이스 리셋
```bash
# Development
pnpm reset:db
```

## 🔧 환경 변수

### API 환경 변수
- `config/environments/development.env`
- `config/environments/staging.env`
- `config/environments/production.env`

### Backoffice 환경 변수
- `apps/backoffice/.env.development`
- `apps/backoffice/.env.staging`
- `apps/backoffice/.env.production`

## 🚨 문제 해결

### 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :3001
lsof -i :3002
lsof -i :3004

# 프로세스 종료
kill -9 <PID>
```

### Docker 정리
```bash
# 모든 컨테이너 중지 및 삭제
docker compose down --remove-orphans

# 이미지 삭제
docker rmi $(docker images -q)

# 볼륨 삭제
docker volume prune
```

### 의존성 문제
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm install
```

## 📝 개발 워크플로우

1. **환경 선택**: dev, staging, prod 중 선택
2. **API 서버 시작**: Docker Compose로 실행
3. **Backoffice 시작**: 개별 실행
4. **개발 작업**: Hot reload 지원
5. **테스트**: 각 환경별로 테스트
6. **정리**: 개발 완료 후 리소스 정리

## 🎯 권장사항

- **개발 시**: `./scripts/start-dev.sh dev` 사용
- **테스트 시**: staging 환경으로 테스트
- **배포 시**: production 환경으로 최종 확인
- **정리**: 개발 완료 후 Docker 리소스 정리

## 📝 사용 시나리오

1. **개발자**: `./scripts/start-dev.sh dev`로 개발 환경 실행
2. **테스터**: `./scripts/start-dev.sh staging`으로 스테이징 환경 테스트
3. **운영자**: `./scripts/start-dev.sh prod`로 프로덕션 환경 확인
