import { IsEnum, IsArray, IsString, IsOptional } from 'class-validator';
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
