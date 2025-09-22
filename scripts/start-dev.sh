#!/bin/bash

# 통합 개발 환경 실행 스크립트
# API (Docker) + Backoffice (개별 실행)

set -e

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting Development Environment for $ENVIRONMENT..."

# 프로젝트 루트로 이동
cd "$PROJECT_ROOT"

# Docker Compose 파일 선택
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

# API 서버 시작 (Docker)
echo "🐳 Starting API server with Docker..."
docker compose -f "$COMPOSE_FILE" up -d

# 잠시 대기 (API 서버 시작 시간)
echo "⏳ Waiting for API server to start..."
sleep 10

# Backoffice 시작 (개별 실행)
echo "🎯 Starting Backoffice..."
echo "📝 Note: Backoffice will run in the foreground. Press Ctrl+C to stop."
echo ""

# Backoffice 스크립트 실행
exec "$SCRIPT_DIR/start-backoffice.sh" "$ENVIRONMENT"
