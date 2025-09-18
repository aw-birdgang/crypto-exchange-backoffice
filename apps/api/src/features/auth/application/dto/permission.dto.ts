import { IsEnum, IsArray, IsString, IsOptional, IsEmail, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, Resource, Permission } from '@crypto-exchange/shared';

export class CreateRolePermissionDto {
  @ApiProperty({
    description: '사용자 역할',
    enum: UserRole,
    example: UserRole.ADMIN
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: '리소스',
    enum: Resource,
    example: Resource.DASHBOARD
  })
  @IsEnum(Resource)
  resource: Resource;

  @ApiProperty({
    description: '권한 목록',
    enum: Permission,
    isArray: true,
    example: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE]
  })
  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions: Permission[];
}

export class UpdateRolePermissionDto {
  @ApiPropertyOptional({
    description: '사용자 역할',
    enum: UserRole,
    example: UserRole.ADMIN
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: '리소스',
    enum: Resource,
    example: Resource.DASHBOARD
  })
  @IsOptional()
  @IsEnum(Resource)
  resource?: Resource;

  @ApiPropertyOptional({
    description: '권한 목록',
    enum: Permission,
    isArray: true,
    example: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions?: Permission[];
}

export class PermissionCheckDto {
  @ApiProperty({
    description: '리소스',
    enum: Resource,
    example: Resource.DASHBOARD
  })
  @IsEnum(Resource)
  resource: Resource;

  @ApiProperty({
    description: '권한',
    enum: Permission,
    example: Permission.READ
  })
  @IsEnum(Permission)
  permission: Permission;
}

export class UserPermissionsResponseDto {
  @ApiProperty({
    description: '사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  userId: string;

  @ApiProperty({
    description: '사용자 역할',
    enum: UserRole,
    example: UserRole.ADMIN
  })
  role: UserRole;

  @ApiProperty({
    description: '권한 목록',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        resource: {
          type: 'string',
          enum: Object.values(Resource)
        },
        permissions: {
          type: 'array',
          items: {
            type: 'string',
            enum: Object.values(Permission)
          }
        }
      }
    },
    example: [
      {
        resource: 'users',
        permissions: ['create', 'read', 'update', 'delete']
      }
    ]
  })
  permissions: {
    resource: Resource;
    permissions: Permission[];
  }[];
}

export class PermissionCheckResponseDto {
  @ApiProperty({
    description: '권한 보유 여부',
    example: true
  })
  hasPermission: boolean;

  @ApiPropertyOptional({
    description: '권한 확인 실패 사유',
    example: 'Insufficient permissions'
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class MenuAccessResponseDto {
  @ApiProperty({
    description: '메뉴 접근 권한 여부',
    example: true
  })
  hasAccess: boolean;
}

export class CreateRoleDto {
  @ApiProperty({
    description: '역할 이름',
    example: 'moderator',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: '역할 설명',
    example: '모더레이터 역할',
    maxLength: 200
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: '시스템 역할 여부',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({
    description: '역할 이름',
    example: 'updated_moderator',
    minLength: 2,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({
    description: '역할 설명',
    example: '업데이트된 모더레이터 역할',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class RoleResponseDto {
  @ApiProperty({
    description: '역할 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({
    description: '역할 이름',
    example: 'moderator'
  })
  name: string;

  @ApiProperty({
    description: '역할 설명',
    example: '모더레이터 역할'
  })
  description: string;

  @ApiProperty({
    description: '시스템 역할 여부',
    example: false
  })
  isSystem: boolean;

  @ApiProperty({
    description: '권한 목록',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        resource: { enum: Object.values(Resource) },
        permissions: { type: 'array', items: { enum: Object.values(Permission) } }
      }
    }
  })
  permissions: Array<{
    resource: Resource;
    permissions: Permission[];
  }>;

  @ApiProperty({
    description: '생성일시',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time'
  })
  createdAt: string;

  @ApiProperty({
    description: '수정일시',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time'
  })
  updatedAt: string;
}

export class CreateUserDto {
  @ApiProperty({
    description: '사용자 이메일 주소',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '사용자 비밀번호',
    example: 'password123',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: '사용자 이름',
    example: 'John'
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: '사용자 성',
    example: 'Doe'
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: '사용자 역할',
    enum: UserRole,
    example: UserRole.USER
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({
    description: '사용자 활성 상태',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: '사용자 이메일 주소',
    example: 'updated-user@example.com',
    format: 'email'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: '사용자 비밀번호',
    example: 'newpassword123',
    minLength: 6
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    description: '사용자 이름',
    example: 'Updated John'
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: '사용자 성',
    example: 'Updated Doe'
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: '사용자 역할',
    enum: UserRole,
    example: UserRole.USER
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: '사용자 활성 상태',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UserResponseDto {
  @ApiProperty({
    description: '사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: '사용자 이름',
    example: 'John'
  })
  firstName: string;

  @ApiProperty({
    description: '사용자 성',
    example: 'Doe'
  })
  lastName: string;

  @ApiProperty({
    description: '사용자 역할',
    enum: UserRole,
    example: UserRole.USER
  })
  role: UserRole;

  @ApiProperty({
    description: '사용자 활성 상태',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: '마지막 로그인 시간',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time'
  })
  lastLoginAt: string;

  @ApiProperty({
    description: '생성일시',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time'
  })
  createdAt: string;

  @ApiProperty({
    description: '수정일시',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time'
  })
  updatedAt: string;
}

export class RoleListResponseDto {
  @ApiProperty({
    description: '역할 목록',
    type: [RoleResponseDto]
  })
  roles: RoleResponseDto[];

  @ApiProperty({
    description: '총 개수',
    example: 5
  })
  total: number;
}

export class UserListResponseDto {
  @ApiProperty({
    description: '사용자 목록',
    type: [UserResponseDto]
  })
  users: UserResponseDto[];

  @ApiProperty({
    description: '총 개수',
    example: 150
  })
  total: number;
}
