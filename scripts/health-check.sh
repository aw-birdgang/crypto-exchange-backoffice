#!/bin/bash

# Health check script for multi-environment deployment
# Usage: ./scripts/health-check.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-dev}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}Error: Invalid environment. Use: dev, staging, or prod${NC}"
    exit 1
fi

echo -e "${BLUE}Health check for environment: ${ENVIRONMENT}${NC}"

# Set ports based on environment
if [ "$ENVIRONMENT" == "dev" ]; then
    API_PORT=3001
    BACKOFFICE_PORT=3000
elif [ "$ENVIRONMENT" == "staging" ]; then
    API_PORT=3002
    BACKOFFICE_PORT=3003
elif [ "$ENVIRONMENT" == "prod" ]; then
    API_PORT=3004
    BACKOFFICE_PORT=3005
fi

# Health check function
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $service_name... "
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Check API health
echo -e "${YELLOW}Checking API health...${NC}"
if check_service "API" "http://localhost:$API_PORT/health"; then
    echo -e "${GREEN}API is healthy${NC}"
else
    echo -e "${RED}API health check failed${NC}"
    exit 1
fi

# Check Backoffice
echo -e "${YELLOW}Checking Backoffice...${NC}"
if check_service "Backoffice" "http://localhost:$BACKOFFICE_PORT" 200; then
    echo -e "${GREEN}Backoffice is healthy${NC}"
else
    echo -e "${RED}Backoffice health check failed${NC}"
    exit 1
fi

# Check database connection (if API is running)
echo -e "${YELLOW}Checking database connection...${NC}"
DB_STATUS=$(curl -s "http://localhost:$API_PORT/health" | jq -r '.database.status' 2>/dev/null || echo "unknown")
if [ "$DB_STATUS" == "ok" ]; then
    echo -e "${GREEN}Database connection is healthy${NC}"
else
    echo -e "${RED}Database connection check failed${NC}"
    exit 1
fi

echo -e "${GREEN}All health checks passed for ${ENVIRONMENT}${NC}"
