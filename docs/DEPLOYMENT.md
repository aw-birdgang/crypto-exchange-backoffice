# 멀티스테이징 배포 가이드

이 문서는 Crypto Exchange Backoffice 프로젝트의 멀티스테이징 환경(dev, staging, prod) 배포 방법을 설명합니다.

## 📋 목차

- [환경 구성](#환경-구성)
- [사전 요구사항](#사전-요구사항)
- [환경별 설정](#환경별-설정)
- [로컬 개발 환경](#로컬-개발-환경)
- [배포 방법](#배포-방법)
- [모니터링 및 헬스체크](#모니터링-및-헬스체크)
- [트러블슈팅](#트러블슈팅)

## 🏗️ 환경 구성

### 환경별 포트 구성

| 환경 | API 포트 | Backoffice 포트 | MySQL 포트 | Redis 포트 |
|------|----------|-----------------|------------|------------|
| Development | 3001 | 3000 | 3306 | 6379 |
| Staging | 3002 | 3003 | 3307 | 6380 |
| Production | 3004 | 3005 | 3308 | 6381 |

### 환경별 데이터베이스

- **Development**: `crypto_exchange_dev`
- **Staging**: `crypto_exchange_staging`
- **Production**: `crypto_exchange_prod`

## 🔧 사전 요구사항

### 필수 소프트웨어

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- Git

### 환경 변수 설정

각 환경별로 필요한 환경 변수를 설정해야 합니다:

```bash
# config/environments/{environment}.env 파일에 설정
DB_HOST=your-database-host
DB_USERNAME=your-database-username
DB_PASSWORD=your-database-password
JWT_SECRET=your-jwt-secret
REDIS_PASSWORD=your-redis-password
FRONTEND_URL=your-frontend-url
VITE_API_BASE_URL=your-api-base-url
```

## ⚙️ 환경별 설정

### Development 환경

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

### Staging 환경

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

### Production 환경

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

## 🚀 배포 방법

### 1. 수동 배포

#### 전체 서비스 배포
```bash
# 특정 환경으로 전체 서비스 배포
./scripts/deploy.sh [environment] up

# 예시
./scripts/deploy.sh dev up
./scripts/deploy.sh staging up
./scripts/deploy.sh prod up
```

#### 개별 서비스 배포
```bash
# API만 빌드
./scripts/build.sh [environment] api

# Backoffice만 빌드
./scripts/build.sh [environment] backoffice

# 전체 빌드
./scripts/build.sh [environment] all
```

### 2. Docker Compose를 사용한 배포

#### Development
```bash
# 개발 환경 시작
docker compose -f docker-compose.dev.yml up -d

# 개발 환경 중지
docker compose -f docker-compose.dev.yml down

# 개발 환경 로그
docker compose -f docker-compose.dev.yml logs -f
```

#### Staging
```bash
# 스테이징 환경 시작
docker compose -f docker-compose.staging.yml up -d

# 스테이징 환경 중지
docker compose -f docker-compose.staging.yml down

# 스테이징 환경 로그
docker compose -f docker-compose.staging.yml logs -f
```

#### Production
```bash
# 프로덕션 환경 시작
docker compose -f docker-compose.production.yml up -d

# 프로덕션 환경 중지
docker compose -f docker-compose.production.yml down

# 프로덕션 환경 로그
docker compose -f docker-compose.production.yml logs -f
```

### 3. CI/CD를 통한 자동 배포

#### GitHub Actions 워크플로우

1. **개발 브랜치 (dev)**: 자동으로 개발 환경에 배포
2. **스테이징 브랜치 (staging)**: 자동으로 스테이징 환경에 배포
3. **메인 브랜치 (main)**: 자동으로 프로덕션 환경에 배포

#### 수동 배포 트리거

GitHub Actions에서 `workflow_dispatch`를 사용하여 수동으로 배포를 트리거할 수 있습니다.

## 🔍 모니터링 및 헬스체크

### 헬스체크 실행

```bash
# 환경별 헬스체크
./scripts/health-check.sh [environment]

# 예시
./scripts/health-check.sh dev
./scripts/health-check.sh staging
./scripts/health-check.sh prod
```

### 헬스체크 항목

- API 서버 상태 (`/health` 엔드포인트)
- Backoffice 서버 상태
- 데이터베이스 연결 상태
- Redis 연결 상태

### 모니터링 엔드포인트

- **API Health**: `http://localhost:{API_PORT}/health`
- **Backoffice**: `http://localhost:{BACKOFFICE_PORT}`

## 🐛 트러블슈팅

### 일반적인 문제

#### 1. 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :3001
lsof -i :3002
lsof -i :3003

# 포트를 사용하는 프로세스 종료
kill -9 {PID}
```

#### 2. Docker 컨테이너 문제
```bash
# 컨테이너 상태 확인
docker ps -a

# 컨테이너 로그 확인
docker logs {container_name}

# 컨테이너 재시작
docker restart {container_name}
```

#### 3. 데이터베이스 연결 문제
```bash
# 데이터베이스 컨테이너 상태 확인
docker logs crypto-exchange-db-{environment}

# 데이터베이스 연결 테스트
docker exec -it crypto-exchange-db-{environment} mysql -u {username} -p
```

#### 4. 환경 변수 문제
```bash
# 환경 변수 확인
docker exec -it crypto-exchange-api-{environment} env | grep DB_

# 환경 변수 파일 확인
cat config/environments/{environment}.env
```

### 로그 확인

#### Docker Compose 로그
```bash
# 전체 서비스 로그
docker compose -f docker-compose.{environment}.yml logs -f

# 특정 서비스 로그
docker compose -f docker-compose.{environment}.yml logs -f api
docker compose -f docker-compose.{environment}.yml logs -f backoffice
```

#### 개별 컨테이너 로그
```bash
# API 로그
docker logs -f crypto-exchange-api-{environment}

# Backoffice 로그
docker logs -f crypto-exchange-backoffice-{environment}

# 데이터베이스 로그
docker logs -f crypto-exchange-db-{environment}
```

### 데이터베이스 초기화

```bash
# 데이터베이스 초기화 (개발 환경)
pnpm init:db:local

# Docker 환경에서 데이터베이스 초기화
pnpm init:db:docker

# 데이터베이스 리셋
pnpm reset:db
```

## 📚 추가 리소스

- [Docker Compose 문서](https://docs.docker.com/compose/)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [NestJS 배포 가이드](https://docs.nestjs.com/recipes/deployment)
- [React 배포 가이드](https://create-react-app.dev/docs/deployment/)

## 🤝 지원

문제가 발생하거나 질문이 있으시면 다음을 통해 문의해주세요:

- GitHub Issues
- 팀 슬랙 채널
- 이메일: dev-team@crypto-exchange.com
