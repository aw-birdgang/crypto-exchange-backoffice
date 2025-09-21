# 🗄️ 정리된 데이터베이스 초기화 가이드

이 문서는 정리된 데이터베이스 초기화 방법을 설명합니다. 불필요한 스크립트들을 제거하고 핵심 기능만 남겼습니다.

## 🚀 **간편한 초기화 방법 (추천)**

### 1. 자동 환경 감지
```bash
# 루트 디렉토리에서
pnpm init:db

# 또는 API 디렉토리에서
cd apps/api
pnpm init:db
```

### 2. 환경별 초기화
```bash
# 로컬 환경 (localhost)
pnpm init:db:local

# Docker 환경 (mysql 컨테이너)
pnpm init:db:docker
```

### 3. 데이터베이스 리셋
```bash
# 기존 데이터 삭제 후 초기화
pnpm reset:db
```

## 🐳 **Docker를 사용한 초기화**

### 1. 간편한 Docker 초기화
```bash
# 루트 디렉토리에서
pnpm init:db:docker
```

### 2. Docker Compose로 자동 초기화
```bash
# 데이터베이스 초기화 서비스 실행
docker compose up db-init
```

### 3. 개발용 Docker 환경 사용
```bash
# 개발용 Docker Compose로 실행 (소스 코드 포함)
pnpm docker:dev

# 개발용 환경에서 초기화
pnpm docker:dev:init
```

## 📋 **사용 가능한 명령어 정리**

### **루트 디렉토리 명령어**
| 명령어 | 설명 | 사용 시기 |
|--------|------|-----------|
| `pnpm init:db` | 자동 환경 감지로 초기화 (추천) | 일반적인 경우 |
| `pnpm init:db:local` | 로컬 환경 강제 초기화 | localhost:3306 사용 |
| `pnpm init:db:docker` | Docker 환경 초기화 | mysql 컨테이너 사용 |
| `pnpm reset:db` | 데이터 삭제 후 초기화 | 완전 리셋 필요 시 |
| `pnpm clean:db` | 데이터베이스 정리만 | 데이터만 삭제 |

### **API 디렉토리 명령어**
| 명령어 | 설명 |
|--------|------|
| `pnpm init:db` | 자동 환경 감지 초기화 |
| `pnpm init:db:local` | 로컬 환경 초기화 |
| `pnpm init:db:docker` | Docker 환경 초기화 |
| `pnpm reset:db` | 리셋 후 초기화 |
| `pnpm clean:db` | 데이터베이스 정리 |

## 🎯 **초기화되는 데이터**

### 관리자 사용자 계정
| 역할 | 이메일 | 사용자명 | 비밀번호 |
|------|--------|----------|----------|
| SUPER_ADMIN | superadmin@crypto-exchange.com | superadmin | superadmin123! |
| ADMIN | admin@crypto-exchange.com | admin | admin123! |
| MODERATOR | moderator@crypto-exchange.com | moderator | moderator123! |
| SUPPORT | support@crypto-exchange.com | support | support123! |
| AUDITOR | auditor@crypto-exchange.com | auditor | auditor123! |

### 역할 (Roles)
- **SUPER_ADMIN**: 최고 관리자 - 모든 권한
- **ADMIN**: 일반 관리자 - 대부분의 관리 권한
- **MODERATOR**: 모더레이터 - 콘텐츠 관리 권한
- **SUPPORT**: 고객 지원 - 제한된 관리 권한
- **AUDITOR**: 감사자 - 읽기 전용 권한

## 🔧 **사용 전 준비사항**

### 1. Docker 컨테이너 실행
```bash
# MySQL 데이터베이스 컨테이너 실행
docker compose up mysql -d

# 또는 전체 서비스 실행
docker compose up -d
```

### 2. 컨테이너 상태 확인
```bash
# 실행 중인 컨테이너 확인
docker ps

# MySQL 컨테이너 로그 확인
docker logs crypto-exchange-db
```

## 🚨 **문제 해결**

### 1. 연결 오류
```bash
# Docker 컨테이너 상태 확인
docker ps

# MySQL 컨테이너 재시작
docker restart crypto-exchange-db
```

### 2. 권한 오류
```bash
# MySQL 컨테이너에 접속하여 사용자 확인
docker exec -it crypto-exchange-db mysql -u root -ppassword -e "SELECT User, Host FROM mysql.user WHERE User='crypto_user';"
```

### 3. 초기화 실패
```bash
# 기존 데이터 삭제 후 재시도
pnpm reset:db
```

## 🎉 **빠른 시작**

1. **Docker 시작**: `docker compose up -d`
2. **데이터베이스 초기화**: `pnpm init:db`
3. **로그인**: `superadmin@crypto-exchange.com` / `superadmin123!`


##

cd apps/api && DB_HOST=localhost DB_PORT=3306 DB_USERNAME=crypto_user DB_PASSWORD=password DB_DATABASE=crypto_exchange JWT_SECRET=your-super-secret-jwt-key-change-in-production JWT_EXPIRES_IN=24h NODE_ENV=development pnpm init:db
