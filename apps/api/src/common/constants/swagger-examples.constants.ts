/**
 * Swagger API 응답 예제 상수들
 */
export const SwaggerExamples = {
  // 사용자 관련 예제
  USER: {
    PROFILE: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'admin@crypto-exchange.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      lastLoginAt: '2024-01-01T10:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T10:00:00.000Z'
    },
    ROLE_INFO: {
      roleId: '123e4567-e89b-12d3-a456-426614174000',
      roleName: 'admin',
      adminRole: 'ADMIN'
    },
    AUTH_RESPONSE: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'admin@crypto-exchange.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      }
    }
  },

  // 역할 관련 예제
  ROLE: {
    DETAIL: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'admin',
      description: '관리자 역할',
      isSystem: true,
      permissions: [
        {
          id: 'perm-1',
          role: 'admin',
          resource: 'DASHBOARD',
          permissions: ['READ'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    LIST: {
      roles: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'admin',
          description: '관리자 역할',
          isSystem: true,
          permissions: [],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ],
      total: 1
    }
  },

  // 통계 관련 예제
  STATS: {
    ADMIN: {
      totalUsers: 150,
      activeUsers: 142,
      adminCount: 5,
      todayRegistrations: 12,
      weeklyRegistrations: 45,
      monthlyRegistrations: 180,
      roleStats: {
        super_admin: 1,
        admin: 4,
        user: 120,
        support: 20,
        auditor: 5
      }
    }
  },

  // 에러 응답 예제
  ERROR: {
    VALIDATION: {
      statusCode: 400,
      message: 'Validation failed',
      error: 'Bad Request'
    },
    UNAUTHORIZED: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized'
    },
    FORBIDDEN: {
      statusCode: 403,
      message: 'Forbidden',
      error: 'Forbidden'
    },
    NOT_FOUND: {
      statusCode: 404,
      message: 'Not Found',
      error: 'Not Found'
    },
    INTERNAL_SERVER_ERROR: {
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error'
    }
  },

  // API 응답 예제
  API_RESPONSE: {
    SUCCESS: {
      success: true,
      message: 'Success',
      data: {},
      timestamp: '2024-01-01T00:00:00.000Z',
      requestId: 'req-123456789'
    },
    ERROR: {
      success: false,
      message: 'Validation failed',
      errorCode: 'VALIDATION_ERROR',
      statusCode: 400,
      timestamp: '2024-01-01T00:00:00.000Z',
      requestId: 'req-123456789',
      details: ['email must be an email']
    }
  },

  // 헬스체크 예제
  HEALTH: {
    BASIC: {
      status: 'ok',
      info: {
        database: { status: 'up' },
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' }
      },
      error: {},
      details: {
        database: { status: 'up' },
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' }
      }
    },
    DETAILED: {
      status: 'ok',
      info: {
        database: { status: 'up' },
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' },
        storage: { status: 'up' }
      },
      error: {},
      details: {
        database: { status: 'up' },
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' },
        storage: { status: 'up' }
      }
    },
    LEGACY: {
      status: 'healthy',
      timestamp: '2025-09-20T05:00:21.691Z',
      uptime: 1234567,
      version: '1.0.0',
      environment: 'development'
    },
    LEGACY_DETAILED: {
      status: 'healthy',
      timestamp: '2025-09-20T05:00:21.691Z',
      uptime: 1234567,
      version: '1.0.0',
      environment: 'development',
      dependencies: {
        database: {
          status: 'healthy',
          responseTime: 15
        },
        cache: {
          status: 'healthy',
          responseTime: 5
        }
      },
      memory: {
        used: 45,
        total: 128,
        percentage: 35.16
      },
      cpu: {
        usage: 0
      }
    }
  }
};
