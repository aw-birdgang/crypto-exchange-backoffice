#!/bin/bash

# 데이터베이스 초기화 스크립트
# 실행: ./scripts/init-database.sh

echo "🚀 Starting database initialization..."

# 컨테이너가 실행 중인지 확인
if ! docker ps | grep -q "crypto-exchange-api"; then
    echo "❌ crypto-exchange-api container is not running!"
    echo "Please start the containers first: docker compose up -d"
    exit 1
fi

if ! docker ps | grep -q "crypto-exchange-db"; then
    echo "❌ crypto-exchange-db container is not running!"
    echo "Please start the containers first: docker compose up -d"
    exit 1
fi

# MySQL이 준비될 때까지 대기
echo "⏳ Waiting for MySQL to be ready..."
for i in {1..10}; do
  echo "Attempt $i/10: Checking MySQL connection..."
  
  if docker exec crypto-exchange-db mysqladmin ping -h localhost -u crypto_user -ppassword --silent; then
    echo "✅ MySQL is ready!"
    break
  fi
  
  if [ $i -eq 10 ]; then
    echo "❌ MySQL failed to start within 60 seconds"
    exit 1
  fi
  
  echo "⏳ MySQL not ready yet, waiting 6 seconds..."
  sleep 6
done

# API 컨테이너가 준비될 때까지 대기
echo "⏳ Waiting for API container to be ready..."
for i in {1..10}; do
  echo "Attempt $i/10: Checking API container..."
  
  if docker exec crypto-exchange-api node -e "console.log('API ready')" > /dev/null 2>&1; then
    echo "✅ API container is ready!"
    break
  fi
  
  if [ $i -eq 10 ]; then
    echo "❌ API container failed to start within 60 seconds"
    exit 1
  fi
  
  echo "⏳ API container not ready yet, waiting 6 seconds..."
  sleep 6
done

echo "🌱 Running database initialization..."

# 로컬에서 초기화 스크립트 실행
cd apps/api && DB_HOST=localhost DB_PORT=3306 DB_USERNAME=crypto_user DB_PASSWORD=password DB_DATABASE=crypto_exchange pnpm init:db

if [ $? -eq 0 ]; then
    echo "✅ Database initialization completed successfully!"
    echo ""
    echo "📋 Available login accounts:"
    echo "  SUPER_ADMIN: superadmin@crypto-exchange.com / superadmin123!"
    echo "  ADMIN:       admin@crypto-exchange.com / admin123!"
    echo "  MODERATOR:   moderator@crypto-exchange.com / moderator123!"
    echo "  SUPPORT:     support@crypto-exchange.com / support123!"
    echo "  AUDITOR:     auditor@crypto-exchange.com / auditor123!"
    echo ""
    echo "🌐 API Server: http://localhost:3001"
    echo "📚 API Documentation: http://localhost:3001/api-docs"
else
    echo "❌ Database initialization failed!"
    exit 1
fi
