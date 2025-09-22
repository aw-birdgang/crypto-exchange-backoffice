#!/bin/bash

# Deployment script for multi-environment deployment
# Usage: ./scripts/deploy.sh [environment] [action]
# Environment: dev, staging, prod
# Action: up, down, restart, logs, status

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-dev}
ACTION=${2:-up}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}Error: Invalid environment. Use: dev, staging, or prod${NC}"
    exit 1
fi

# Validate action
if [[ ! "$ACTION" =~ ^(up|down|restart|logs|status|build)$ ]]; then
    echo -e "${RED}Error: Invalid action. Use: up, down, restart, logs, status, build${NC}"
    exit 1
fi

echo -e "${BLUE}Deploying to environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Action: ${ACTION}${NC}"

# Set compose file based on environment
if [ "$ENVIRONMENT" == "dev" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
elif [ "$ENVIRONMENT" == "staging" ]; then
    COMPOSE_FILE="docker-compose.staging.yml"
elif [ "$ENVIRONMENT" == "prod" ]; then
    COMPOSE_FILE="docker-compose.production.yml"
fi

# Load environment variables
if [ -f "config/environments/${ENVIRONMENT}.env" ]; then
    echo -e "${YELLOW}Loading environment variables from config/environments/${ENVIRONMENT}.env${NC}"
    export $(cat config/environments/${ENVIRONMENT}.env | grep -v '^#' | xargs)
fi

# Handle different actions
case $ACTION in
    "build")
        echo -e "${YELLOW}Building Docker images for ${ENVIRONMENT}...${NC}"
        docker compose -f $COMPOSE_FILE build --no-cache
        echo -e "${GREEN}Build completed${NC}"
        ;;
    "up")
        echo -e "${YELLOW}Starting services for ${ENVIRONMENT}...${NC}"
        docker compose -f $COMPOSE_FILE up -d
        echo -e "${GREEN}Services started successfully${NC}"
        ;;
    "down")
        echo -e "${YELLOW}Stopping services for ${ENVIRONMENT}...${NC}"
        docker compose -f $COMPOSE_FILE down
        echo -e "${GREEN}Services stopped successfully${NC}"
        ;;
    "restart")
        echo -e "${YELLOW}Restarting services for ${ENVIRONMENT}...${NC}"
        docker compose -f $COMPOSE_FILE restart
        echo -e "${GREEN}Services restarted successfully${NC}"
        ;;
    "logs")
        echo -e "${YELLOW}Showing logs for ${ENVIRONMENT}...${NC}"
        docker compose -f $COMPOSE_FILE logs -f
        ;;
    "status")
        echo -e "${YELLOW}Service status for ${ENVIRONMENT}:${NC}"
        docker compose -f $COMPOSE_FILE ps
        ;;
esac
