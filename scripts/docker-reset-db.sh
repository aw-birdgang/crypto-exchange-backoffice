#!/bin/bash

# Database reset script for crypto-exchange
# This script will clean up the database and restart the services

echo "🔄 Resetting crypto-exchange database..."

# Stop all services
echo "⏹️  Stopping services..."
docker-compose -f apps/api/docker-compose.yml down

# Remove database volume to ensure clean state
echo "🗑️  Removing database volume..."
docker volume rm crypto-exchange-backoffice_postgres_data 2>/dev/null || true

# Remove any orphaned containers
echo "🧹 Cleaning up orphaned containers..."
docker container prune -f

# Start services again
echo "🚀 Starting services..."
docker-compose -f apps/api/docker-compose.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is accessible
echo "🔍 Checking database connection..."
docker exec crypto-exchange-db psql -U postgres -d crypto_exchange -c "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Database is ready!"
    echo "🎉 Services are running. You can now access:"
    echo "   - API: http://localhost:3001"
    echo "   - Database: localhost:5432"
else
    echo "❌ Database connection failed. Check the logs:"
    echo "   docker logs crypto-exchange-db"
    echo "   docker logs crypto-exchange-api"
fi
