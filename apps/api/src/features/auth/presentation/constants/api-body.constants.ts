import {ApiBody} from '@nestjs/swagger';
import {
  AdminBulkActionDto,
  CreateAdminDto,
  UpdateAdminDto
} from '../../application/dto/admin.dto';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto
} from '../../application/dto/auth.dto';
import {
  CreateRoleDto,
  CreateRolePermissionDto,
  CreateUserDto,
  PermissionCheckDto,
  UpdateRoleDto,
  UpdateUserDto
} from '../../application/dto/permission.dto';

/**
 * API Body 예제들을 상수로 정의합니다.
 */
export const API_BODY_EXAMPLES = {
  // 인증 관련
  REGISTER: {
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
  },

  LOGIN: {
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
  },

  REFRESH_TOKEN: {
    description: '리프레시 토큰'
  },

  // 관리자 관련
  CREATE_ADMIN: {
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
  },

  UPDATE_ADMIN: {
    description: '수정할 관리자 정보'
  },

  // 사용자 관련
  CREATE_USER: {
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
  },

  UPDATE_USER: {
    description: '수정할 사용자 정보'
  },

  // 대량 작업
  BULK_ACTION: {
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
  },

  // 권한 관련
  PERMISSION_CHECK: {
    description: '권한 확인 요청'
  },

  CREATE_ROLE_PERMISSION: {
    description: '생성할 역할 권한 정보'
  },

  CREATE_ROLE: {
    description: '생성할 역할 정보'
  },

  UPDATE_ROLE: {
    description: '수정할 역할 정보'
  }
} as const;

/**
 * ApiBody 데코레이터를 생성하는 헬퍼 함수들
 */
export const ApiBodyHelpers = {
  register: () => ApiBody({ type: RegisterDto, ...API_BODY_EXAMPLES.REGISTER }),
  login: () => ApiBody({ type: LoginDto, ...API_BODY_EXAMPLES.LOGIN }),
  refreshToken: () => ApiBody({ type: RefreshTokenDto, ...API_BODY_EXAMPLES.REFRESH_TOKEN }),
  createAdmin: () => ApiBody({ type: CreateAdminDto, ...API_BODY_EXAMPLES.CREATE_ADMIN }),
  updateAdmin: () => ApiBody({ type: UpdateAdminDto, ...API_BODY_EXAMPLES.UPDATE_ADMIN }),
  createUser: () => ApiBody({ type: CreateUserDto, ...API_BODY_EXAMPLES.CREATE_USER }),
  updateUser: () => ApiBody({ type: UpdateUserDto, ...API_BODY_EXAMPLES.UPDATE_USER }),
  bulkAction: () => ApiBody({ type: AdminBulkActionDto, ...API_BODY_EXAMPLES.BULK_ACTION }),
  permissionCheck: () => ApiBody({ type: PermissionCheckDto, ...API_BODY_EXAMPLES.PERMISSION_CHECK }),
  createRolePermission: () => ApiBody({ type: CreateRolePermissionDto, ...API_BODY_EXAMPLES.CREATE_ROLE_PERMISSION }),
  createRole: () => ApiBody({ type: CreateRoleDto, ...API_BODY_EXAMPLES.CREATE_ROLE }),
  updateRole: () => ApiBody({ type: UpdateRoleDto, ...API_BODY_EXAMPLES.UPDATE_ROLE })
};
