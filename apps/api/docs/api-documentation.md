# Crypto Exchange API - API Documentation

## 📋 Table of Contents
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Versioning](#api-versioning)
- [SDK Examples](#sdk-examples)

## 🎯 API Overview

The Crypto Exchange API provides comprehensive backend services for cryptocurrency exchange backoffice operations. Built with NestJS and following RESTful principles, it offers secure, scalable, and well-documented endpoints.

### Base URL
```
Development: http://localhost:3001/api/v1
Production: https://api.crypto-exchange.com/api/v1
```

### API Features
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permission system
- **API Versioning**: Multiple API versions support
- **Rate Limiting**: Request throttling and protection
- **Comprehensive Logging**: Detailed request/response logging
- **Health Monitoring**: Built-in health checks
- **Swagger Documentation**: Interactive API documentation

## 🔐 Authentication

### Authentication Flow

1. **Login**: POST `/auth/login`
2. **Receive Tokens**: Access token + Refresh token
3. **Use Access Token**: Include in Authorization header
4. **Refresh Token**: Use refresh token when access token expires

### Token Usage

```http
Authorization: Bearer <access_token>
```

### Token Types

#### Access Token
- **Lifetime**: 24 hours (configurable)
- **Usage**: API request authentication
- **Format**: JWT (JSON Web Token)

#### Refresh Token
- **Lifetime**: 7 days (configurable)
- **Usage**: Generate new access tokens
- **Format**: JWT (JSON Web Token)

## 🚀 API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new admin user account.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "회원가입이 완료되었습니다. 관리자 승인을 기다려주세요.",
    "userId": "cmfkr31v7000wcm9urdbekf4u"
  },
  "message": "Success",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "requestId": "req-123"
}
```

#### POST /auth/login
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cmfkr31v7000wcm9urdbekf4u",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN"
    }
  },
  "message": "Success",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "requestId": "req-123"
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Success",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "requestId": "req-123"
}
```

#### GET /auth/profile
Get current user profile information.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cmfkr31v7000wcm9urdbekf4u",
    "email": "admin@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN",
    "permissions": [
      "users:read",
      "users:create",
      "users:update",
      "users:delete"
    ],
    "isActive": true,
    "status": "APPROVED",
    "lastLoginAt": "2025-01-27T09:15:00.000Z",
    "createdAt": "2025-01-20T10:30:00.000Z",
    "updatedAt": "2025-01-27T10:30:00.000Z"
  },
  "message": "Success",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "requestId": "req-123"
}
```

#### GET /auth/my-role
Get current user's role information.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "role-admin",
    "name": "ADMIN",
    "description": "일반 관리자 - 대부분의 관리 권한",
    "isSystem": true,
    "permissions": [
      {
        "resource": "DASHBOARD",
        "permissions": ["READ"]
      },
      {
        "resource": "USERS",
        "permissions": ["CREATE", "READ", "UPDATE", "DELETE"]
      }
    ]
  },
  "message": "Success",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "requestId": "req-123"
}
```

### Health Check Endpoints

#### GET /health
Basic health check endpoint.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-27T10:30:00.000Z",
    "uptime": 3600000,
    "version": "1.0.0",
    "environment": "development"
  },
  "message": "Success",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "requestId": "req-123"
}
```

#### GET /health/detailed
Detailed health check with dependencies.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-27T10:30:00.000Z",
    "uptime": 3600000,
    "version": "1.0.0",
    "environment": "development",
    "dependencies": {
      "database": {
        "status": "healthy",
        "responseTime": 15
      },
      "cache": {
        "status": "healthy",
        "responseTime": 5
      }
    },
    "memory": {
      "used": 128,
      "total": 512,
      "percentage": 25.0
    },
    "cpu": {
      "usage": 15.5
    }
  },
  "message": "Success",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "requestId": "req-123"
}
```

## 📊 Data Models

### AdminUser Entity

```typescript
interface AdminUser {
  id: string;                    // UUID
  email: string;                 // Unique email address
  username: string;              // Username
  password: string;              // Hashed password
  firstName: string;             // First name
  lastName: string;              // Last name
  adminRole: AdminUserRole;      // User role
  permissions: string[];         // Permission list
  isActive: boolean;             // Active status
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  approvedBy?: string;           // Approver ID
  approvedAt?: Date;             // Approval date
  lastLoginAt?: Date;            // Last login
  createdAt: Date;               // Creation date
  updatedAt: Date;               // Last update
  createdBy?: string;            // Creator
  updatedBy?: string;            // Last updater
}
```

### AdminUserRole Enum

```typescript
enum AdminUserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  SUPPORT = 'SUPPORT',
  AUDITOR = 'AUDITOR'
}
```

### Role Entity

```typescript
interface Role {
  id: string;                    // Role ID
  name: string;                  // Role name
  description: string;           // Role description
  isSystem: boolean;             // System role flag
  createdAt: Date;               // Creation date
  updatedAt: Date;               // Last update
}
```

### Permission Entity

```typescript
interface Permission {
  id: string;                    // Permission ID
  name: string;                  // Permission name
  description: string;           // Permission description
  resource: Resource;            // Resource type
  action: Action;                // Action type
  createdAt: Date;               // Creation date
  updatedAt: Date;               // Last update
}
```

## 🚨 Error Handling

### Error Response Format

All API errors follow a consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "AUTH_AUTH_INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "status": 401,
    "severity": "error",
    "category": "authentication",
    "details": {
      "email": "user@example.com"
    },
    "timestamp": "2025-01-27T10:30:00.000Z",
    "requestId": "req-123"
  },
  "data": null,
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

### Error Categories

| Category | Description | Example Codes |
|----------|-------------|---------------|
| Authentication | Auth-related errors | `AUTH_AUTH_INVALID_CREDENTIALS` |
| Authorization | Permission-related errors | `AUTH_AUTHZ_INSUFFICIENT_PERMISSIONS` |
| Validation | Input validation errors | `VALIDATION_INVALID_INVALID_EMAIL_FORMAT` |
| User | User management errors | `USER_NOT_FOUND_USER_NOT_FOUND` |
| Permission | Permission management errors | `PERMISSION_NOT_FOUND_PERMISSION_NOT_FOUND` |
| System | System-related errors | `SYSTEM_INTERNAL_INTERNAL_SERVER_ERROR` |
| Network | Network-related errors | `NETWORK_INTERNAL_CONNECTION_FAILED` |
| Rate Limit | Rate limiting errors | `RATE_LIMIT_RATE_LIMIT_RATE_LIMIT_EXCEEDED` |

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## ⚡ Rate Limiting

### Rate Limit Headers

The API includes rate limiting headers in all responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643284800
```

### Rate Limit Configuration

- **Default Limit**: 100 requests per 15 minutes
- **Window**: 15 minutes (900,000 ms)
- **Scope**: Per IP address + User-Agent + Path
- **Headers**: Included in all responses

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_RATE_LIMIT_RATE_LIMIT_EXCEEDED",
    "message": "Too Many Requests",
    "status": 429,
    "severity": "warning",
    "category": "rate_limit",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetTime": 1643284800
    },
    "timestamp": "2025-01-27T10:30:00.000Z",
    "requestId": "req-123"
  },
  "data": null,
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

## 🔄 API Versioning

### Version Detection

The API supports multiple version detection methods:

1. **URL-based**: `/api/v1/auth/login`
2. **Header-based**: `api-version: v1` or `accept-version: v1`
3. **Default**: Falls back to `v1` if no version specified

### Version Headers

Response includes current API version:

```http
X-API-Version: v1
```

### Version Strategy

- **Backward Compatibility**: Older versions remain supported
- **Gradual Migration**: Phased rollout of new versions
- **Deprecation Notice**: Clear deprecation warnings
- **Documentation**: Version-specific documentation

## 💻 SDK Examples

### JavaScript/TypeScript

```typescript
class CryptoExchangeAPI {
  private baseURL: string;
  private accessToken?: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.success) {
      this.accessToken = data.data.accessToken;
    }
    return data;
  }

  async getProfile() {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    return response.json();
  }
}

// Usage
const api = new CryptoExchangeAPI('http://localhost:3001/api/v1');
await api.login('admin@example.com', 'password');
const profile = await api.getProfile();
```

### Python

```python
import requests
import json

class CryptoExchangeAPI:
    def __init__(self, base_url):
        self.base_url = base_url
        self.access_token = None

    def login(self, email, password):
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        data = response.json()
        if data["success"]:
            self.access_token = data["data"]["accessToken"]
        return data

    def get_profile(self):
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.get(
            f"{self.base_url}/auth/profile",
            headers=headers
        )
        return response.json()

# Usage
api = CryptoExchangeAPI("http://localhost:3001/api/v1")
api.login("admin@example.com", "password")
profile = api.get_profile()
```

### cURL Examples

#### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'
```

#### Get Profile
```bash
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer <access_token>"
```

#### Health Check
```bash
curl -X GET http://localhost:3001/health
```

## 📚 Additional Resources

### Swagger Documentation
Interactive API documentation is available at:
- Development: `http://localhost:3001/api-docs`
- Production: `https://api.crypto-exchange.com/api-docs`

### Postman Collection
A Postman collection is available for testing all API endpoints with pre-configured requests and examples.

### OpenAPI Specification
The complete OpenAPI 3.0 specification is available at:
- Development: `http://localhost:3001/api-docs-json`
- Production: `https://api.crypto-exchange.com/api-docs-json`

This comprehensive API documentation provides everything needed to integrate with the Crypto Exchange API effectively and securely.
