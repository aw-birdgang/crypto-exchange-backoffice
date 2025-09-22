#!/bin/bash

# Docker 환경에서 데이터베이스 초기화 스크립트
# 사용법: ./scripts/init-db-docker.sh [environment]

set -e

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🗄️ Initializing database for $ENVIRONMENT environment..."

# 프로젝트 루트로 이동
cd "$PROJECT_ROOT"

# 환경별 Docker Compose 파일 선택
case $ENVIRONMENT in
  "dev")
    COMPOSE_FILE="docker-compose.dev.yml"
    ;;
  "staging")
    COMPOSE_FILE="docker-compose.staging.yml"
    ;;
  "prod"|"production")
    COMPOSE_FILE="docker-compose.production.yml"
    ;;
  *)
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [dev|staging|prod]"
    exit 1
    ;;
esac

echo "📋 Using Docker Compose file: $COMPOSE_FILE"

# 데이터베이스 서비스만 시작
echo "🐳 Starting database services..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans mysql redis

# 데이터베이스가 준비될 때까지 대기
echo "⏳ Waiting for database to be ready..."
sleep 10

# 데이터베이스 초기화 실행
echo "🔧 Initializing database..."
case $ENVIRONMENT in
  "dev")
    docker compose -f "$COMPOSE_FILE" run --rm --remove-orphans api pnpm init:db:docker:dev
    ;;
  "staging")
    docker compose -f "$COMPOSE_FILE" run --rm --remove-orphans api pnpm init:db:docker:staging
    ;;
  "prod"|"production")
    docker compose -f "$COMPOSE_FILE" run --rm --remove-orphans api pnpm init:db:docker:prod
    ;;
esac

echo "✅ Database initialization completed!"
echo "🎯 You can now start the full environment with:"
echo "   docker compose -f $COMPOSE_FILE up -d"
