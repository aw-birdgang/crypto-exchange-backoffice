import { applyDecorators } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

/**
 * 재사용 가능한 ApiBody 데코레이터들을 정의합니다.
 */
export class ApiBodyDecorators {
  /**
   * 회원가입용 ApiBody 데코레이터
   */
  static RegisterBody() {
    return applyDecorators(
      ApiBody({
        description: '회원가입 정보',
        examples: {
          example1: {
            summary: '일반 사용자 회원가입',
            value: {
              email: 'user@example.com',
              password: 'password123',
              firstName: 'John',
              lastName: 'Doe'
            }
          }
        }
      })
    );
  }

  /**
   * 로그인용 ApiBody 데코레이터
   */
  static LoginBody() {
    return applyDecorators(
      ApiBody({
        description: '로그인 정보',
        examples: {
          admin: {
            summary: '관리자 로그인',
            value: {
              email: 'superadmin@crypto-exchange.com',
              password: 'superadmin123!'
            }
          },
          user: {
            summary: '일반 사용자 로그인',
            value: {
              email: 'user@example.com',
              password: 'password123'
            }
          }
        }
      })
    );
  }

  /**
   * 리프레시 토큰용 ApiBody 데코레이터
   */
  static RefreshTokenBody() {
    return applyDecorators(
      ApiBody({
        description: '리프레시 토큰'
      })
    );
  }

  /**
   * 관리자 생성용 ApiBody 데코레이터
   */
  static CreateAdminBody() {
    return applyDecorators(
      ApiBody({
        description: '생성할 관리자 정보',
        examples: {
          superAdmin: {
            summary: '슈퍼 관리자 생성',
            value: {
              email: 'superadmin@crypto-exchange.com',
              password: 'superadmin123!',
              firstName: 'Super',
              lastName: 'Admin',
              role: 'super_admin',
              isActive: true
            }
          },
          admin: {
            summary: '일반 관리자 생성',
            value: {
              email: 'admin@crypto-exchange.com',
              password: 'admin123!',
              firstName: 'Admin',
              lastName: 'User',
              role: 'admin',
              isActive: true
            }
          }
        }
      })
    );
  }

  /**
   * 관리자 수정용 ApiBody 데코레이터
   */
  static UpdateAdminBody() {
    return applyDecorators(
      ApiBody({
        description: '수정할 관리자 정보'
      })
    );
  }

  /**
   * 사용자 생성용 ApiBody 데코레이터 (관리자 권한)
   */
  static CreateUserBody() {
    return applyDecorators(
      ApiBody({
        description: '생성할 사용자 정보',
        examples: {
          example1: {
            summary: '일반 사용자 생성',
            value: {
              email: 'user@example.com',
              password: 'Password123!',
              firstName: 'John',
              lastName: 'Doe',
              role: 'user',
              isActive: true
            }
          }
        }
      })
    );
  }

  /**
   * 사용자 수정용 ApiBody 데코레이터 (관리자 권한)
   */
  static UpdateUserBody() {
    return applyDecorators(
      ApiBody({
        description: '수정할 사용자 정보'
      })
    );
  }

  /**
   * 대량 작업용 ApiBody 데코레이터
   */
  static BulkActionBody() {
    return applyDecorators(
      ApiBody({
        description: '대량 작업 정보',
        examples: {
          activate: {
            summary: '사용자 활성화',
            value: {
              userIds: ['user1', 'user2', 'user3'],
              action: 'activate'
            }
          },
          changeRole: {
            summary: '사용자 역할 변경',
            value: {
              userIds: ['user1', 'user2'],
              action: 'change_role',
              newRole: 'trader'
            }
          }
        }
      })
    );
  }

  /**
   * 권한 확인용 ApiBody 데코레이터
   */
  static PermissionCheckBody() {
    return applyDecorators(
      ApiBody({
        description: '권한 확인 요청'
      })
    );
  }

  /**
   * 역할 권한 생성용 ApiBody 데코레이터
   */
  static CreateRolePermissionBody() {
    return applyDecorators(
      ApiBody({
        description: '생성할 역할 권한 정보'
      })
    );
  }

  /**
   * 역할 생성용 ApiBody 데코레이터
   */
  static CreateRoleBody() {
    return applyDecorators(
      ApiBody({
        description: '생성할 역할 정보'
      })
    );
  }

  /**
   * 역할 수정용 ApiBody 데코레이터
   */
  static UpdateRoleBody() {
    return applyDecorators(
      ApiBody({
        description: '수정할 역할 정보'
      })
    );
  }
}
