# Crypto Exchange API - Architecture Overview

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Architecture Patterns](#architecture-patterns)
- [Project Structure](#project-structure)
- [Core Modules](#core-modules)
- [Feature Modules](#feature-modules)
- [Configuration Management](#configuration-management)
- [Security Architecture](#security-architecture)
- [Database Architecture](#database-architecture)
- [Caching Strategy](#caching-strategy)
- [Error Handling](#error-handling)
- [API Versioning](#api-versioning)
- [Performance Considerations](#performance-considerations)
- [Deployment Architecture](#deployment-architecture)

## 🎯 Project Overview

The Crypto Exchange API is a NestJS-based backend service designed for cryptocurrency exchange backoffice operations. It follows Clean Architecture principles with a focus on maintainability, scalability, and security.

### Key Characteristics
- **Framework**: NestJS with TypeScript
- **Database**: MySQL with TypeORM
- **Caching**: Redis for session and data caching
- **Authentication**: JWT-based authentication with role-based access control
- **API Documentation**: Swagger/OpenAPI 3.0
- **Architecture**: Clean Architecture with Domain-Driven Design

## 🏗️ Architecture Patterns

### 1. Clean Architecture
The project follows Clean Architecture principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  (Controllers, DTOs, Guards, Interceptors, Middleware)     │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                        │
│  (Services, Use Cases, Mappers, Strategies)                │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                           │
│  (Entities, Interfaces, Business Logic)                    │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                      │
│  (Repositories, External Services, Database)               │
└─────────────────────────────────────────────────────────────┘
```

### 2. Domain-Driven Design (DDD)
- **Entities**: Core business objects (AdminUser, Role, Permission)
- **Value Objects**: Immutable objects representing concepts
- **Repositories**: Data access abstractions
- **Services**: Domain logic and business rules

### 3. Dependency Injection
- Uses NestJS's built-in DI container
- Interface-based programming for loose coupling
- Provider pattern for service registration

## 📁 Project Structure

```
apps/api/
├── src/
│   ├── app.module.ts                 # Root module
│   ├── main.ts                      # Application bootstrap
│   ├── config/                      # Configuration modules
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── validation.schema.ts
│   ├── common/                      # Shared utilities
│   │   ├── cache/                   # Redis caching
│   │   ├── config/                  # Swagger configuration
│   │   ├── constants/               # Application constants
│   │   ├── decorators/              # Custom decorators
│   │   ├── dto/                     # Shared DTOs
│   │   ├── exceptions/              # Error handling
│   │   ├── guards/                  # Authentication/Authorization
│   │   ├── health/                  # Health checks
│   │   ├── interceptors/            # Request/Response interceptors
│   │   ├── logger/                  # Logging service
│   │   ├── middleware/              # Custom middleware
│   │   ├── pipes/                   # Validation pipes
│   │   ├── security/                # Security utilities
│   │   └── utils/                   # Utility functions
│   ├── features/                    # Feature modules
│   │   └── auth/                    # Authentication feature
│   │       ├── application/         # Application layer
│   │       │   ├── decorators/
│   │       │   ├── dto/
│   │       │   ├── guards/
│   │       │   ├── providers/
│   │       │   ├── services/
│   │       │   └── strategies/
│   │       ├── domain/              # Domain layer
│   │       │   ├── entities/
│   │       │   ├── mappers/
│   │       │   └── repositories/
│   │       ├── infrastructure/      # Infrastructure layer
│   │       │   └── repositories/
│   │       └── presentation/        # Presentation layer
│   │           ├── components/
│   │           ├── constants/
│   │           ├── decorators/
│   │           ├── guards/
│   │           └── swagger/
│   └── scripts/                     # Database scripts
├── test/                           # E2E tests
├── docs/                           # Documentation
├── puml/                           # PlantUML diagrams
└── package.json
```

## 🔧 Core Modules

### 1. Configuration Module (`config/`)
Centralized configuration management using NestJS ConfigModule:

- **app.config.ts**: Application settings, security, CORS, pagination
- **database.config.ts**: TypeORM database configuration
- **jwt.config.ts**: JWT token configuration
- **validation.schema.ts**: Environment variable validation using Joi

### 2. Cache Module (`common/cache/`)
Redis-based caching system:

- **CacheService**: Generic caching operations
- **TTL Management**: Configurable expiration times
- **Error Handling**: Graceful fallback when Redis is unavailable
- **Key Generation**: Structured key naming conventions

### 3. Logger Module (`common/logger/`)
Structured logging system:

- **LogLevels**: ERROR, WARN, INFO, DEBUG, VERBOSE
- **Context Support**: Request ID, user ID, operation tracking
- **Environment-specific**: Console logging for dev, JSON for production
- **Performance Logging**: Operation duration tracking

### 4. Health Module (`common/health/`)
Comprehensive health monitoring:

- **Basic Health**: Application uptime and version
- **Detailed Health**: Database, cache, memory, CPU status
- **Readiness Probe**: Service readiness for traffic
- **Liveness Probe**: Service survival check

## 🎯 Feature Modules

### Authentication Module (`features/auth/`)

#### Domain Layer
- **Entities**: AdminUser, Role, RolePermission
- **Interfaces**: Repository contracts
- **Mappers**: Domain-object transformations

#### Application Layer
- **Services**: AuthService, PermissionService, AdminService
- **DTOs**: Request/Response data transfer objects
- **Guards**: JWT authentication, permission-based authorization
- **Strategies**: Passport JWT strategy

#### Infrastructure Layer
- **Repositories**: TypeORM-based data access
- **Database**: MySQL with proper indexing

#### Presentation Layer
- **Controllers**: REST API endpoints
- **Swagger**: API documentation
- **Validation**: Input validation and sanitization

## ⚙️ Configuration Management

### Environment Variables
```typescript
// Required variables
NODE_ENV=development|production|test
PORT=3001
DB_HOST=localhost
DB_USERNAME=crypto_user
DB_PASSWORD=password
DB_DATABASE=crypto_exchange
JWT_SECRET=your-super-secret-jwt-key

// Optional variables with defaults
DB_PORT=3306
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
API_RATE_LIMIT=100
```

### Configuration Validation
- Joi schema validation for all environment variables
- Type-safe configuration access
- Default values for optional settings
- Environment-specific configurations

## 🔐 Security Architecture

### 1. Authentication
- **JWT Tokens**: Stateless authentication
- **Refresh Tokens**: Long-lived token refresh mechanism
- **Password Hashing**: bcrypt with configurable rounds
- **Token Validation**: Middleware-based token verification

### 2. Authorization
- **Role-Based Access Control (RBAC)**: AdminUserRole enum
- **Permission System**: Resource-based permissions
- **Guard System**: Route-level access control
- **API Versioning**: Version-specific access control

### 3. Security Headers
- **Helmet**: Security headers middleware
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Request rate limiting per IP/user
- **Input Validation**: Class-validator based validation

### 4. Data Protection
- **Password Encryption**: bcrypt with salt
- **Sensitive Data**: Environment variable protection
- **SQL Injection**: TypeORM query builder protection
- **XSS Protection**: Input sanitization

## 🗄️ Database Architecture

### Database Design
- **MySQL**: Primary database
- **TypeORM**: Object-Relational Mapping
- **Migrations**: Database schema versioning
- **Indexing**: Performance optimization

### Entity Relationships
```
AdminUser (1) ←→ (1) Role
    ↓
RolePermission (M) ←→ (1) Role
    ↓
Permission (M) ←→ (1) Resource
```

### Key Entities
- **AdminUser**: User accounts with roles and permissions
- **Role**: System roles (SUPER_ADMIN, ADMIN, etc.)
- **RolePermission**: Role-permission mappings
- **Permission**: Resource-based permissions

## 💾 Caching Strategy

### Redis Configuration
- **Connection Pooling**: Optimized connection management
- **Error Handling**: Graceful degradation
- **TTL Management**: Automatic expiration
- **Key Naming**: Structured key conventions

### Cache Usage
- **Session Storage**: User session data
- **Rate Limiting**: Request count tracking
- **Query Results**: Database query caching
- **Configuration**: Application settings cache

## 🚨 Error Handling

### Exception Hierarchy
```typescript
EnhancedBusinessException
├── AuthException
├── UserException
├── PermissionException
├── WalletException
├── CustomerException
├── SystemException
├── ValidationException
├── NetworkException
└── RateLimitException
```

### Error Response Format
```typescript
{
  success: false,
  error: {
    code: "AUTH_AUTH_INVALID_CREDENTIALS",
    message: "Invalid email or password",
    status: 401,
    severity: "error",
    category: "authentication",
    details: { email: "user@example.com" },
    timestamp: "2025-01-27T10:30:00.000Z",
    requestId: "req-123"
  },
  data: null,
  timestamp: "2025-01-27T10:30:00.000Z"
}
```

## 🔄 API Versioning

### Version Management
- **URL-based**: `/api/v1/`, `/api/v2/`
- **Header-based**: `api-version`, `accept-version`
- **Middleware**: Automatic version detection
- **Decorators**: `@ApiVersion('v1')`

### Version Strategy
- **Backward Compatibility**: Maintain older versions
- **Gradual Migration**: Phased rollout
- **Deprecation**: Clear deprecation notices
- **Documentation**: Version-specific docs

## ⚡ Performance Considerations

### 1. Database Optimization
- **Connection Pooling**: Efficient connection management
- **Query Optimization**: Indexed queries
- **Lazy Loading**: On-demand data loading
- **Caching**: Query result caching

### 2. Memory Management
- **Streaming**: Large data streaming
- **Compression**: Response compression
- **Memory Monitoring**: Health check integration
- **Garbage Collection**: Optimized GC settings

### 3. Request Processing
- **Rate Limiting**: Request throttling
- **Request ID**: Request tracking
- **Performance Interceptors**: Response time monitoring
- **Async Processing**: Non-blocking operations

## 🚀 Deployment Architecture

### Development Environment
```yaml
services:
  api:
    build: .
    ports: ["3001:3001"]
    environment:
      - NODE_ENV=development
      - DB_HOST=mysql
    depends_on: [mysql, redis]
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_DATABASE=crypto_exchange
      - MYSQL_USER=crypto_user
      - MYSQL_PASSWORD=password
  
  redis:
    image: redis:7-alpine
```

### Production Considerations
- **Load Balancing**: Multiple API instances
- **Database Clustering**: MySQL cluster setup
- **Redis Cluster**: High availability caching
- **Monitoring**: Application performance monitoring
- **Logging**: Centralized log aggregation
- **Security**: Network security and SSL/TLS

## 📊 Monitoring and Observability

### Health Checks
- **Liveness**: Service survival check
- **Readiness**: Service readiness check
- **Dependencies**: Database and cache status
- **Metrics**: Memory, CPU, response times

### Logging
- **Structured Logging**: JSON format in production
- **Request Tracking**: Request ID correlation
- **Performance Logging**: Operation duration
- **Security Logging**: Authentication events

### Metrics
- **Response Times**: API endpoint performance
- **Error Rates**: Error frequency tracking
- **Throughput**: Request volume monitoring
- **Resource Usage**: Memory and CPU utilization

## 🔧 Development Guidelines

### Code Organization
- **Feature-based**: Group by business features
- **Layer separation**: Clear architectural boundaries
- **Interface contracts**: Loose coupling
- **Dependency injection**: Testable code

### Testing Strategy
- **Unit Tests**: Service and utility testing
- **Integration Tests**: Database and external service testing
- **E2E Tests**: Full API workflow testing
- **Mocking**: External dependency mocking

### Code Quality
- **TypeScript**: Strong typing
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

## 📈 Scalability Considerations

### Horizontal Scaling
- **Stateless Design**: No server-side session storage
- **Load Balancing**: Multiple API instances
- **Database Sharding**: Data partitioning strategies
- **Cache Distribution**: Redis cluster setup

### Vertical Scaling
- **Resource Optimization**: Memory and CPU tuning
- **Database Optimization**: Query and index optimization
- **Caching Strategy**: Aggressive caching where appropriate
- **Connection Pooling**: Efficient resource utilization

This architecture provides a solid foundation for a scalable, maintainable, and secure cryptocurrency exchange backoffice API system.
