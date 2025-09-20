import { IsEmail, IsString, IsOptional, IsBoolean, IsEnum, MinLength, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdminUserRole, Resource, Permission } from '@crypto-exchange/shared';

export class CreateAdminDto {
  @ApiProperty({
    description: '관리자 이메일 주소',
    example: 'admin@crypto-exchange.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '관리자 비밀번호',
    example: 'admin123!',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: '관리자 이름',
    example: 'Admin'
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: '관리자 성',
    example: 'User'
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: '관리자 역할',
    enum: [AdminUserRole.SUPER_ADMIN, AdminUserRole.ADMIN],
    example: AdminUserRole.ADMIN
  })
  @IsEnum([AdminUserRole.SUPER_ADMIN, AdminUserRole.ADMIN])
  role: AdminUserRole.SUPER_ADMIN | AdminUserRole.ADMIN;

  @ApiPropertyOptional({
    description: '관리자 활성 상태',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAdminDto {
  @ApiPropertyOptional({
    description: '관리자 이메일 주소',
    example: 'updated-admin@crypto-exchange.com',
    format: 'email'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: '관리자 비밀번호',
    example: 'newpassword123!',
    minLength: 8
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    description: '관리자 이름',
    example: 'Updated Admin'
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: '관리자 성',
    example: 'Updated User'
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: '관리자 역할',
    enum: [AdminUserRole.SUPER_ADMIN, AdminUserRole.ADMIN],
    example: AdminUserRole.SUPER_ADMIN
  })
  @IsOptional()
  @IsEnum([AdminUserRole.SUPER_ADMIN, AdminUserRole.ADMIN])
  role?: AdminUserRole.SUPER_ADMIN | AdminUserRole.ADMIN;

  @ApiPropertyOptional({
    description: '관리자 활성 상태',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdminStatsDto {
  @ApiProperty({
    description: '전체 사용자 수',
    example: 150
  })
  totalUsers: number;

  @ApiProperty({
    description: '활성 사용자 수',
    example: 142
  })
  activeUsers: number;

  @ApiProperty({
    description: '관리자 수',
    example: 5
  })
  adminCount: number;

  @ApiProperty({
    description: '오늘 가입한 사용자 수',
    example: 12
  })
  todayRegistrations: number;

  @ApiProperty({
    description: '이번 주 가입한 사용자 수',
    example: 45
  })
  weeklyRegistrations: number;

  @ApiProperty({
    description: '이번 달 가입한 사용자 수',
    example: 180
  })
  monthlyRegistrations: number;

  @ApiProperty({
    description: '사용자 역할별 통계',
    example: {
      super_admin: 1,
      admin: 4,
      user_manager: 2,
      order_manager: 3,
      market_manager: 2,
      wallet_manager: 1,
      user: 120,
      trader: 15
    }
  })
  roleStats: Record<string, number>;
}

export class AdminDashboardDto {
  @ApiProperty({
    description: '시스템 통계',
    type: AdminStatsDto
  })
  stats: AdminStatsDto;

  @ApiProperty({
    description: '최근 활동 로그',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        action: { type: 'string' },
        user: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        details: { type: 'string' }
      }
    },
    example: [
      {
        id: '1',
        action: 'USER_CREATED',
        user: 'admin@crypto-exchange.com',
        timestamp: '2024-01-01T10:00:00.000Z',
        details: 'Created new user: user@example.com'
      }
    ]
  })
  recentActivities: Array<{
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details: string;
  }>;

  @ApiProperty({
    description: '시스템 상태',
    example: {
      database: 'healthy',
      redis: 'healthy',
      api: 'healthy'
    }
  })
  systemStatus: {
    database: string;
    redis: string;
    api: string;
  };
}

export class AdminPermissionDto {
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

export class AdminRolePermissionsDto {
  @ApiProperty({
    description: '역할',
    enum: AdminUserRole,
    example: AdminUserRole.ADMIN
  })
  @IsEnum(AdminUserRole)
  role: AdminUserRole;

  @ApiProperty({
    description: '권한 목록',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        resource: { enum: Object.values(Resource) },
        permissions: { type: 'array', items: { enum: Object.values(Permission) } }
      }
    },
    example: [
      {
        resource: 'users',
        permissions: ['create', 'read', 'update', 'delete']
      }
    ]
  })
  permissions: AdminPermissionDto[];
}

export class AdminBulkActionDto {
  @ApiProperty({
    description: '대상 사용자 ID 목록',
    type: 'array',
    items: { type: 'string' },
    example: ['user1', 'user2', 'user3']
  })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @ApiProperty({
    description: '수행할 작업',
    enum: ['activate', 'deactivate', 'delete', 'change_role'],
    example: 'activate'
  })
  @IsEnum(['activate', 'deactivate', 'delete', 'change_role'])
  action: 'activate' | 'deactivate' | 'delete' | 'change_role';

  @ApiPropertyOptional({
    description: '새로운 역할 (change_role 작업시에만 사용)',
    enum: AdminUserRole,
    example: AdminUserRole.SUPPORT
  })
  @IsOptional()
  @IsEnum(AdminUserRole)
  newRole?: AdminUserRole;
}
