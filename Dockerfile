# Multi-stage build for NestJS API
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies (including devDependencies for build)
RUN pnpm install

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared package first
RUN pnpm --filter @crypto-exchange/shared build

# Build API
RUN pnpm --filter @crypto-exchange/api build

# Verify build output
RUN ls -la /app/apps/api/dist/

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies (including typeorm which is needed at runtime)
RUN pnpm install

# Copy built application
COPY --from=base /app/packages/shared/dist ./packages/shared/dist
COPY --from=base /app/apps/api/dist ./apps/api/dist

# Verify copied files
RUN ls -la /app/apps/api/dist/

# Expose port
EXPOSE 3001

# Set working directory to API
WORKDIR /app/apps/api

# Start the application
CMD ["node", "dist/apps/api/src/main.js"]
