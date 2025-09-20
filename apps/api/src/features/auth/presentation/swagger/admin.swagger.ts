import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiAuthEndpoint, ApiSuccessResponse } from '../../../../common/decorators/swagger.decorator';
import { SwaggerExamples } from '../../../../common/constants/swagger-examples.constants';

/**
 * Admin Controller용 Swagger 헬퍼
 */
export class AdminSwagger {
  // 대시보드 관련
  static getDashboard() {
    return applyDecorators(
      ApiAuthEndpoint(
        '관리자 대시보드',
        '관리자 대시보드 데이터를 조회합니다.'
      ),
      ApiSuccessResponse(200, '대시보드 조회 성공', {
        stats: SwaggerExamples.STATS.ADMIN,
        recentActivities: [],
        systemStatus: {
          database: 'up',
          redis: 'up',
          api: 'up'
        }
      })
    );
  }

  static getStats() {
    return applyDecorators(
      ApiAuthEndpoint(
        '시스템 통계',
        '시스템 사용자 통계를 조회합니다.'
      ),
      ApiSuccessResponse(200, '통계 조회 성공', SwaggerExamples.STATS.ADMIN)
    );
  }

  // 관리자 관리 관련
  static getAllAdmins() {
    return applyDecorators(
      ApiAuthEndpoint(
        '관리자 목록 조회',
        '모든 관리자 목록을 조회합니다.'
      ),
      ApiSuccessResponse(200, '관리자 목록 조회 성공', [
        {
          id: 'cmfkr31v7000wcm9urdbekf4u',
          email: 'superadmin@crypto-exchange.com',
          username: 'superadmin',
          firstName: 'Super',
          lastName: 'Admin',
          adminRole: 'SUPER_ADMIN',
          permissions: ['users:read', 'users:create', 'users:update', 'users:delete'],
          isActive: true,
          lastLoginAt: '2025-09-15T09:14:56.270Z',
          createdAt: '2025-09-15T06:36:00.692Z',
          updatedAt: '2025-09-15T09:14:56.270Z'
        }
      ])
    );
  }

  static createAdmin() {
    return applyDecorators(
      ApiAuthEndpoint(
        '관리자 생성',
        '새로운 관리자 계정을 생성합니다.'
      ),
      ApiSuccessResponse(201, '관리자 생성 성공', SwaggerExamples.USER.PROFILE)
    );
  }

  static updateAdmin() {
    return applyDecorators(
      ApiAuthEndpoint(
        '관리자 정보 수정',
        '관리자의 정보를 수정합니다.'
      ),
      ApiParam({
        name: 'id',
        description: '관리자 ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }),
      ApiSuccessResponse(200, '관리자 정보 수정 성공', {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'updated-admin@crypto-exchange.com',
        firstName: 'Updated Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      })
    );
  }

  static deleteAdmin() {
    return applyDecorators(
      ApiAuthEndpoint(
        '관리자 삭제',
        '관리자를 삭제합니다. SUPER_ADMIN 권한이 필요합니다.'
      ),
      ApiParam({
        name: 'id',
        description: '관리자 ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }),
      ApiSuccessResponse(200, '관리자 삭제 성공', {
        message: '관리자가 삭제되었습니다.'
      })
    );
  }

  static updateUserAsAdmin() {
    return applyDecorators(
      ApiAuthEndpoint(
        '승인된 사용자 정보 수정',
        '이미 승인된 사용자의 정보를 수정합니다.'
      ),
      ApiParam({
        name: 'id',
        description: '사용자 ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }),
      ApiSuccessResponse(200, '사용자 수정 성공', SwaggerExamples.USER.PROFILE)
    );
  }

  static deleteUser() {
    return applyDecorators(
      ApiAuthEndpoint(
        '사용자 삭제',
        '사용자를 삭제합니다.'
      ),
      ApiParam({
        name: 'id',
        description: '사용자 ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }),
      ApiSuccessResponse(200, '사용자 삭제 성공', {
        message: '사용자가 삭제되었습니다.'
      })
    );
  }

  // 권한 확인 관련
  static checkPermission() {
    return applyDecorators(
      ApiAuthEndpoint(
        '권한 확인',
        '사용자의 특정 권한을 확인합니다.'
      ),
      ApiQuery({
        name: 'resource',
        description: '리소스',
        enum: ['DASHBOARD', 'USERS', 'SETTINGS', 'WALLET', 'TRADING'],
        example: 'DASHBOARD'
      }),
      ApiQuery({
        name: 'permission',
        description: '권한',
        enum: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE'],
        example: 'READ'
      }),
      ApiSuccessResponse(200, '권한 확인 성공', {
        hasPermission: true
      })
    );
  }

  // 대량 작업 관련
  static bulkUserAction() {
    return applyDecorators(
      ApiAuthEndpoint(
        '대량 사용자 작업',
        '여러 사용자에 대해 대량 작업을 수행합니다. (활성화, 비활성화, 삭제, 역할 변경)'
      ),
      ApiSuccessResponse(200, '대량 작업 완료', {
        success: 2,
        failed: 1,
        errors: ['사용자 ID user3를 찾을 수 없습니다.']
      })
    );
  }

  // 사용자 관리 관련
  static getPendingUsers() {
    return applyDecorators(
      ApiAuthEndpoint(
        '승인 대기 사용자 목록',
        '승인을 기다리는 사용자 목록을 조회합니다.'
      ),
      ApiSuccessResponse(200, '승인 대기 사용자 목록 조회 성공', [
        SwaggerExamples.USER.PROFILE
      ])
    );
  }

  static approveUser() {
    return applyDecorators(
      ApiAuthEndpoint(
        '사용자 승인',
        '사용자 계정을 승인합니다.'
      ),
      ApiParam({
        name: 'id',
        description: '사용자 ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }),
      ApiSuccessResponse(200, '사용자 승인 성공', {
        message: '사용자가 승인되었습니다.'
      })
    );
  }

  static rejectUser() {
    return applyDecorators(
      ApiAuthEndpoint(
        '사용자 거부',
        '사용자 계정을 거부합니다.'
      ),
      ApiParam({
        name: 'id',
        description: '사용자 ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }),
      ApiSuccessResponse(200, '사용자 거부 성공', {
        message: '사용자가 거부되었습니다.'
      })
    );
  }

  static suspendUser() {
    return applyDecorators(
      ApiAuthEndpoint(
        '사용자 정지',
        '사용자 계정을 정지합니다.'
      ),
      ApiParam({
        name: 'id',
        description: '사용자 ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }),
      ApiSuccessResponse(200, '사용자 정지 성공', {
        message: '사용자가 정지되었습니다.'
      })
    );
  }

  static activateUser() {
    return applyDecorators(
      ApiAuthEndpoint(
        '사용자 활성화',
        '정지된 사용자 계정을 활성화합니다.'
      ),
      ApiParam({
        name: 'id',
        description: '사용자 ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }),
      ApiSuccessResponse(200, '사용자 활성화 성공', {
        message: '사용자가 활성화되었습니다.'
      })
    );
  }

  // 역할 권한 관련
  static getRolePermissions() {
    return applyDecorators(
      ApiAuthEndpoint(
        '역할 권한 조회',
        '특정 역할의 권한을 조회합니다.'
      ),
      ApiParam({
        name: 'role',
        description: '사용자 역할',
        enum: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT', 'AUDITOR'],
        example: 'ADMIN'
      }),
      ApiSuccessResponse(200, '역할 권한 조회 성공', [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          role: 'admin',
          resource: 'DASHBOARD',
          permissions: ['READ'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ])
    );
  }
}
