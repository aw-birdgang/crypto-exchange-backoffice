#!/bin/bash

# Docker 환경에서 데이터베이스 초기화 스크립트
# 사용법: ./scripts/docker-init-db.sh

echo "🐳 Docker 환경에서 데이터베이스 초기화 시작..."

# Docker 컨테이너가 실행 중인지 확인
if ! docker ps | grep -q "crypto-exchange-db"; then
    echo "❌ MySQL 컨테이너가 실행 중이 아닙니다."
    echo "   먼저 'docker compose up -d' 또는 'pnpm docker:dev'를 실행하세요."
    exit 1
fi

# 데이터베이스 초기화 서비스 실행
echo "🚀 데이터베이스 초기화 서비스 실행 중..."
docker compose up db-init

# 초기화 완료 확인
if [ $? -eq 0 ]; then
    echo "✅ 데이터베이스 초기화가 완료되었습니다!"
    echo ""
    echo "📋 사용 가능한 로그인 계정:"
    echo "  SUPER_ADMIN: superadmin@crypto-exchange.com / superadmin123!"
    echo "  ADMIN:       admin@crypto-exchange.com / admin123!"
    echo "  MODERATOR:   moderator@crypto-exchange.com / moderator123!"
    echo "  SUPPORT:     support@crypto-exchange.com / support123!"
    echo "  AUDITOR:     auditor@crypto-exchange.com / auditor123!"
    echo ""
    echo "🎉 이제 로그인할 수 있습니다!"
else
    echo "❌ 데이터베이스 초기화에 실패했습니다."
    echo "   로그를 확인하세요: docker logs crypto-exchange-db-init"
    exit 1
fi
