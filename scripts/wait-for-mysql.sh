#!/bin/bash

# MySQL이 준비될 때까지 대기하는 스크립트
# 실행: ./scripts/wait-for-mysql.sh

echo "⏳ Waiting for MySQL to be ready..."

# 최대 60초 대기 (6초 간격으로 10번 시도)
for i in {1..10}; do
  echo "Attempt $i/10: Checking MySQL connection..."
  
  if docker exec crypto-exchange-db mysqladmin ping -h localhost -u crypto_user -ppassword --silent; then
    echo "✅ MySQL is ready!"
    exit 0
  fi
  
  echo "⏳ MySQL not ready yet, waiting 6 seconds..."
  sleep 6
done

echo "❌ MySQL failed to start within 60 seconds"
exit 1
