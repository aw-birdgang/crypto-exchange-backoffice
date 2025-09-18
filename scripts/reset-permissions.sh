#!/bin/bash

echo "🔄 Resetting permissions database..."

# Docker 컨테이너가 실행 중인지 확인
if ! docker ps | grep -q "crypto-exchange-postgres"; then
    echo "❌ PostgreSQL container is not running. Please start the database first."
    exit 1
fi

# 데이터베이스 연결 및 권한 테이블 초기화
echo "🗑️ Clearing role_permissions table..."
docker exec crypto-exchange-postgres psql -U postgres -d crypto_exchange -c "DELETE FROM role_permissions;"

echo "✅ Role permissions cleared successfully!"
echo "🚀 Please restart the API server to re-seed the permissions."
