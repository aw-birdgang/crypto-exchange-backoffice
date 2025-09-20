#!/bin/bash

# Docker 컨테이너 내부에서 데이터베이스 정리
# 실행: ./scripts/docker-clean.sh

echo "🚀 Starting Docker clean script..."

# 컨테이너가 실행 중인지 확인
if ! docker ps | grep -q "crypto-exchange-api"; then
    echo "❌ crypto-exchange-api container is not running!"
    echo "Please start the containers first: docker-compose up -d"
    exit 1
fi

echo "🧹 Running database cleanup in Docker container..."
docker exec crypto-exchange-api npm run clean:db

if [ $? -eq 0 ]; then
    echo "✅ Database cleanup completed successfully!"
else
    echo "❌ Database cleanup failed!"
    exit 1
fi
