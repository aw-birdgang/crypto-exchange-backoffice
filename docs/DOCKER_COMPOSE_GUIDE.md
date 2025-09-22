# Docker Compose 사용 가이드

## 🚀 올바른 Docker Compose 명령어

### Development 환경
```bash
# Development 환경 실행
docker-compose -f docker-compose.dev.yml up --build

# 백그라운드 실행
docker-compose -f docker-compose.dev.yml up -d --build

# 서비스 중지
docker-compose -f docker-compose.dev.yml down
```

### Staging 환경
```bash
# Staging 환경 실행
docker-compose -f docker-compose.staging.yml up --build

# 백그라운드 실행
docker-compose -f docker-compose.staging.yml up -d --build

# 서비스 중지
docker-compose -f docker-compose.staging.yml down
```

### Production 환경
```bash
# Production 환경 실행
docker-compose -f docker-compose.production.yml up --build

# 백그라운드 실행
docker-compose -f docker-compose.production.yml up -d --build

# 서비스 중지
docker-compose -f docker-compose.production.yml down
```

## 📋 환경별 포트 매핑

| 환경 | API 포트 | Backoffice 포트 | MySQL 포트 | Redis 포트 | Swagger 경로 |
|------|----------|-----------------|------------|------------|--------------|
| Development | 3001 | - | 3306 | 6379 | `/api-docs` |
| Staging | 3002 | 3003 | 3307 | 6380 | `/api-docs-staging` |
| Production | 3004 | 3005 | 3308 | 6381 | `/api-docs-prod` |

## 🏗️ Dockerfile 구조

### 현재 사용 중인 Dockerfile들
```
Dockerfile.api.dev          # 개발용 API
Dockerfile.api.staging      # 스테이징용 API
Dockerfile.api.production   # 운영용 API
Dockerfile.backoffice.dev   # 개발용 백오피스
Dockerfile.backoffice.staging   # 스테이징용 백오피스
Dockerfile.backoffice.production # 운영용 백오피스
```

### 제거된 Dockerfile들
```
❌ Dockerfile              # 기본 Dockerfile (제거됨)
❌ Dockerfile.dev         # 개발용 (제거됨)
❌ Dockerfile.backoffice  # 백오피스 (제거됨)
❌ apps/backoffice/Dockerfile # 중복 (제거됨)
```

## 🔧 환경별 설정

### Development 환경
- **목적**: 개발 및 디버깅
- **특징**: 소스 코드 마운트, 핫 리로드 지원
- **데이터베이스**: `crypto_exchange`
- **Swagger**: 초록색 테마

### Staging 환경
- **목적**: 테스트 및 검증
- **특징**: 운영과 유사한 환경
- **데이터베이스**: `crypto_exchange_staging`
- **Swagger**: 주황색 테마

### Production 환경
- **목적**: 실제 운영
- **특징**: 최적화된 빌드, 보안 강화
- **데이터베이스**: `crypto_exchange_prod`
- **Swagger**: 빨간색 테마

## 🚨 주의사항

### 1. 잘못된 명령어
```bash
# ❌ 잘못된 명령어
docker-compose -f docker-compose.prod.yml up --build

# ✅ 올바른 명령어
docker-compose -f docker-compose.production.yml up --build
```

### 2. 환경 변수 설정
```bash
# 환경별 .env 파일 생성 (권장)
cp config/environments/development.env .env
cp config/environments/staging.env .env.staging
cp config/environments/production.env .env.production
```

### 3. 볼륨 정리
```bash
# 사용하지 않는 볼륨 정리
docker volume prune

# 특정 환경 볼륨 정리
docker volume rm crypto-exchange-backoffice_mysql_data_dev
docker volume rm crypto-exchange-backoffice_mysql_data_staging
docker volume rm crypto-exchange-backoffice_mysql_data_prod
```

## 🔍 문제 해결

### 컨테이너 로그 확인
```bash
# API 컨테이너 로그
docker logs crypto-exchange-api-dev
docker logs crypto-exchange-api-staging
docker logs crypto-exchange-api-prod

# 백오피스 컨테이너 로그
docker logs crypto-exchange-backoffice-staging
docker logs crypto-exchange-backoffice-prod
```

### 네트워크 확인
```bash
# 네트워크 목록
docker network ls

# 특정 네트워크 확인
docker network inspect crypto-exchange-backoffice_crypto-exchange-dev-network
```

### 환경 변수 확인
```bash
# Docker Compose 설정 확인
docker-compose -f docker-compose.dev.yml config
docker-compose -f docker-compose.staging.yml config
docker-compose -f docker-compose.production.yml config
```

## 📚 추가 리소스

- [Docker Compose 공식 문서](https://docs.docker.com/compose/)
- [NestJS Docker 가이드](https://docs.nestjs.com/recipes/docker)
- [React Docker 가이드](https://create-react-app.dev/docs/deployment/#docker)
