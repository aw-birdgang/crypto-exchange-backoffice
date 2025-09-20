import { applyDecorators } from '@nestjs/common';
import { ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiAuthEndpoint } from '../../../../common/decorators/swagger.decorator';
import { SwaggerExamples } from '../../../../common/constants/swagger-examples.constants';

/**
 * Permission Controller용 Swagger 헬퍼
 */
export class PermissionSwagger {
  // 권한 확인 관련
  static checkPermission() {
    return applyDecorators(
      ApiAuthEndpoint(
        '권한 확인',
        '사용자의 특정 권한을 확인합니다.'
      ),
      ApiResponse({
        status: 200,
        description: '권한 확인 성공',
        example: {
          hasPermission: true
        }
      })
    );
  }

  static getUserPermissions() {
    return applyDecorators(
      ApiAuthEndpoint(
        '특정 사용자 권한 조회',
        '특정 사용자의 권한 정보를 조회합니다.'
      ),
      ApiParam({
        name: 'userId',
        description: '사용자 ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }),
      ApiResponse({
        status: 200,
        description: '사용자 권한 조회 성공',
        example: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          role: 'admin',
          permissions: [
            {
              resource: 'users',
              permissions: ['create', 'read', 'update', 'delete']
            }
          ]
        }
      })
    );
  }

  static getMyPermissions() {
    return applyDecorators(
      ApiAuthEndpoint(
        '내 권한 조회',
        '현재 로그인한 사용자의 권한 정보를 조회합니다.'
      ),
      ApiResponse({
        status: 200,
        description: '내 권한 조회 성공',
        example: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          role: 'admin',
          permissions: [
            {
              resource: 'users',
              permissions: ['create', 'read', 'update', 'delete']
            }
          ]
        }
      })
    );
  }

  static checkMenuAccess() {
    return applyDecorators(
      ApiAuthEndpoint(
        '메뉴 접근 권한 확인',
        '현재 사용자가 특정 메뉴에 접근할 수 있는지 확인합니다.'
      ),
      ApiParam({
        name: 'menuKey',
        description: '메뉴 키',
        example: 'dashboard'
      }),
      ApiResponse({
        status: 200,
        description: '메뉴 접근 권한 확인 성공',
        example: {
          hasAccess: true
        }
      })
    );
  }

  // 권한 관리 관련
  static createRolePermission() {
    return applyDecorators(
      ApiAuthEndpoint(
        '역할 권한 생성',
        '새로운 역할 권한을 생성합니다.'
      ),
      ApiResponse({
        status: 201,
        description: '역할 권한 생성 성공',
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          role: 'admin',
          resource: 'DASHBOARD',
          permissions: ['READ'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      })
    );
  }

  static updateRolePermission() {
    return applyDecorators(
      ApiAuthEndpoint(
        '역할 권한 수정',
        '기존 역할 권한을 수정합니다.'
      ),
      ApiParam({
        name: 'id',
        description: '역할 권한 ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }),
      ApiResponse({
        status: 200,
        description: '역할 권한 수정 성공',
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          role: 'admin',
          resource: 'DASHBOARD',
          permissions: ['READ', 'WRITE'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      })
    );
  }

  static deleteRolePermission() {
    return applyDecorators(
      ApiAuthEndpoint(
        '역할 권한 삭제',
        '역할 권한을 삭제합니다.'
      ),
      ApiParam({
        name: 'id',
        description: '역할 권한 ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }),
      ApiResponse({
        status: 200,
        description: '역할 권한 삭제 성공',
        example: {
          message: '역할 권한이 삭제되었습니다.'
        }
      })
    );
  }

  // 역할 권한 조회 관련
  static getRolePermissions() {
    return applyDecorators(
      ApiAuthEndpoint(
        '특정 역할의 권한 조회',
        '특정 역할의 권한을 조회합니다.'
      ),
      ApiParam({
        name: 'role',
        description: '사용자 역할',
        enum: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT', 'AUDITOR'],
        example: 'ADMIN'
      }),
      ApiResponse({
        status: 200,
        description: '역할 권한 조회 성공',
        example: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            role: 'admin',
            resource: 'DASHBOARD',
            permissions: ['READ'],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ]
      })
    );
  }

  static getAllRolePermissions() {
    return applyDecorators(
      ApiAuthEndpoint(
        '모든 역할 권한 조회',
        '시스템의 모든 역할 권한을 조회합니다.'
      ),
      ApiResponse({
        status: 200,
        description: '역할 권한 목록 조회 성공',
        example: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            role: 'admin',
            resource: 'DASHBOARD',
            permissions: ['READ'],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ]
      })
    );
  }

  // 역할 관리 관련
  static getAllRoles() {
    return applyDecorators(
      ApiAuthEndpoint(
        '모든 역할 조회',
        '시스템의 모든 역할을 조회합니다.'
      ),
      ApiResponse({
        status: 200,
        description: '역할 목록 조회 성공',
        example: {
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
          total: 5
        }
      })
    );
  }

  static getRoleById() {
    return applyDecorators(
      ApiAuthEndpoint(
        '특정 역할 조회',
        'ID로 특정 역할을 조회합니다.'
      ),
      ApiParam({
        name: 'id',
        description: '역할 ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }),
      ApiResponse({
        status: 200,
        description: '역할 조회 성공',
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'admin',
          description: '관리자 역할',
          isSystem: true,
          permissions: [],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      })
    );
  }

  static createRole() {
    return applyDecorators(
      ApiAuthEndpoint(
        '역할 생성',
        '새로운 역할을 생성합니다. 관리자 권한이 필요합니다.'
      ),
      ApiResponse({
        status: 201,
        description: '역할 생성 성공',
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'moderator',
          description: '모더레이터 역할',
          isSystem: false,
          permissions: [],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      })
    );
  }

  static updateRole() {
    return applyDecorators(
      ApiAuthEndpoint(
        '역할 수정',
        '기존 역할을 수정합니다.'
      ),
      ApiParam({
        name: 'id',
        description: '역할 ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }),
      ApiResponse({
        status: 200,
        description: '역할 수정 성공',
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'updated_moderator',
          description: '업데이트된 모더레이터 역할',
          isSystem: false,
          permissions: [],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      })
    );
  }

  static deleteRole() {
    return applyDecorators(
      ApiAuthEndpoint(
        '역할 삭제',
        '역할을 삭제합니다. 시스템 역할은 삭제할 수 없습니다.'
      ),
      ApiParam({
        name: 'id',
        description: '역할 ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }),
      ApiResponse({
        status: 200,
        description: '역할 삭제 성공',
        example: {
          message: '역할이 삭제되었습니다.'
        }
      })
    );
  }

  // 초기화 관련
  static initializeDefaultPermissions() {
    return applyDecorators(
      ApiAuthEndpoint(
        '기본 권한 초기화',
        '시스템의 기본 권한을 초기화합니다.'
      ),
      ApiResponse({
        status: 200,
        description: '기본 권한 초기화 성공',
        example: {
          message: 'Default permissions initialized successfully'
        }
      })
    );
  }
}