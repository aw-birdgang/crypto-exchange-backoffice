#!/bin/bash

# Backoffice 개별 실행 스크립트
# 사용법: ./scripts/start-backoffice.sh [environment]
# 환경: dev, staging, prod

set -e

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting Backoffice for $ENVIRONMENT environment..."

# 환경별 설정
case $ENVIRONMENT in
  "dev")
    VITE_API_BASE_URL="http://localhost:3001"
    VITE_APP_TITLE="Crypto Exchange Backoffice (Development)"
    BACKOFFICE_PORT=3000
    ;;
  "staging")
    VITE_API_BASE_URL="http://localhost:3002"
    VITE_APP_TITLE="Crypto Exchange Backoffice (Staging)"
    BACKOFFICE_PORT=3010
    ;;
  "prod"|"production")
    VITE_API_BASE_URL="http://localhost:3004"
    VITE_APP_TITLE="Crypto Exchange Backoffice (Production)"
    BACKOFFICE_PORT=3020
    ;;
  *)
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [dev|staging|prod]"
    exit 1
    ;;
esac

# 환경 변수 설정
export VITE_API_BASE_URL
export VITE_APP_TITLE
export NODE_ENV=$ENVIRONMENT
export VITE_PORT=$BACKOFFICE_PORT

echo "📋 Environment Configuration:"
echo "  - API Base URL: $VITE_API_BASE_URL"
echo "  - App Title: $VITE_APP_TITLE"
echo "  - Node Environment: $NODE_ENV"
echo "  - Backoffice Port: $BACKOFFICE_PORT"

# 프로젝트 루트로 이동
cd "$PROJECT_ROOT"

# 의존성 설치 확인
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  pnpm install
fi

# Backoffice 의존성 설치 확인
if [ ! -d "apps/backoffice/node_modules" ]; then
  echo "📦 Installing backoffice dependencies..."
  pnpm --filter @crypto-exchange/backoffice install
fi

# Shared 패키지 빌드
echo "🔨 Building shared package..."
pnpm --filter @crypto-exchange/shared build

# Backoffice 개발 서버 시작
echo "🎯 Starting Backoffice development server..."
echo "🌐 Backoffice will be available at: http://localhost:$BACKOFFICE_PORT"
echo "🔗 API Base URL: $VITE_API_BASE_URL"
echo ""
echo "Press Ctrl+C to stop the server"

pnpm --filter @crypto-exchange/backoffice dev --port $BACKOFFICE_PORT
