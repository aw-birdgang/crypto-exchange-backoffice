#!/bin/bash

# Build script for multi-environment deployment
# Usage: ./scripts/build.sh [environment] [service]
# Environment: dev, staging, prod
# Service: api, backoffice, all

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-dev}
SERVICE=${2:-all}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}Error: Invalid environment. Use: dev, staging, or prod${NC}"
    exit 1
fi

# Validate service
if [[ ! "$SERVICE" =~ ^(api|backoffice|all)$ ]]; then
    echo -e "${RED}Error: Invalid service. Use: api, backoffice, or all${NC}"
    exit 1
fi

echo -e "${BLUE}Building for environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Service: ${SERVICE}${NC}"

# Load environment variables
if [ -f "config/environments/${ENVIRONMENT}.env" ]; then
    echo -e "${YELLOW}Loading environment variables from config/environments/${ENVIRONMENT}.env${NC}"
    export $(cat config/environments/${ENVIRONMENT}.env | grep -v '^#' | xargs)
fi

# Build shared package first
echo -e "${YELLOW}Building shared package...${NC}"
pnpm --filter @crypto-exchange/shared build

# Build API
if [[ "$SERVICE" == "api" || "$SERVICE" == "all" ]]; then
    echo -e "${YELLOW}Building API for ${ENVIRONMENT}...${NC}"
    
    # Copy environment file
    if [ -f "config/environments/${ENVIRONMENT}.env" ]; then
        cp config/environments/${ENVIRONMENT}.env apps/api/.env
    fi
    
    # Build API
    pnpm --filter @crypto-exchange/api build
    
    echo -e "${GREEN}API build completed for ${ENVIRONMENT}${NC}"
fi

# Build Backoffice
if [[ "$SERVICE" == "backoffice" || "$SERVICE" == "all" ]]; then
    echo -e "${YELLOW}Building Backoffice for ${ENVIRONMENT}...${NC}"
    
    # Copy environment file
    if [ -f "config/environments/backoffice-${ENVIRONMENT}.env" ]; then
        cp config/environments/backoffice-${ENVIRONMENT}.env apps/backoffice/.env
    fi
    
    # Set build-time environment variables
    export NODE_ENV=${ENVIRONMENT}
    if [ -n "$VITE_API_BASE_URL" ]; then
        export VITE_API_BASE_URL
    fi
    if [ -n "$VITE_APP_TITLE" ]; then
        export VITE_APP_TITLE
    fi
    
    # Build Backoffice
    pnpm --filter @crypto-exchange/backoffice build
    
    echo -e "${GREEN}Backoffice build completed for ${ENVIRONMENT}${NC}"
fi

echo -e "${GREEN}Build completed successfully for ${ENVIRONMENT}${NC}"
