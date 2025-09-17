# Multi-stage build for React Backoffice
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY apps/backoffice/package.json ./apps/backoffice/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/backoffice ./apps/backoffice

# Build shared package first
RUN pnpm --filter @crypto-exchange/shared build

# Build backoffice
RUN pnpm --filter @crypto-exchange/backoffice build

# Production stage with nginx
FROM nginx:alpine AS production

# Copy built files
COPY --from=base /app/apps/backoffice/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/backoffice/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
