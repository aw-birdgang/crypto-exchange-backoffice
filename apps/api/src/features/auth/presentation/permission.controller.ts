import {Body, Controller, Delete, Get, Inject, Param, Post, Put, Request, UseGuards,} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import {Permission, Resource, Role, UserPermissions, UserRole,} from '@crypto-exchange/shared';
import {PermissionService} from '../application/services/permission.service';
import {
  CreateRolePermissionDto,
  MenuAccessResponseDto,
  PermissionCheckDto,
  PermissionCheckResponseDto,
  CreateRoleDto,
  UpdateRoleDto,
  RoleResponseDto,
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  RoleListResponseDto,
  UserListResponseDto
} from '../application/dto/permission.dto';
import {JwtAuthGuard} from './guards/jwt-auth.guard';
import {PermissionGuard, RequirePermissions,} from '../application/guards/permission.guard';
import {RolePermission} from '../domain/entities/role-permission.entity';

@ApiTags('Permissions')
@ApiBearerAuth('JWT-auth')
@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionController {
  constructor(
    @Inject(PermissionService)
    private permissionService: PermissionService
  ) {}

  @Get('user/:userId')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @ApiOperation({
    summary: '특정 사용자 권한 조회',
    description: '특정 사용자의 권한 정보를 조회합니다.'
  })
  @ApiParam({
    name: 'userId',
    description: '사용자 ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
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
  @ApiBadRequestResponse({ description: '잘못된 사용자 ID 형식' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiNotFoundResponse({ description: '사용자를 찾을 수 없음' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async getUserPermissions(
    @Param('userId') userId: string
  ): Promise<UserPermissions> {
    return this.permissionService.getUserPermissions(userId);
  }

  @Get('my-permissions')
  @ApiOperation({
    summary: '내 권한 조회',
    description: '현재 로그인한 사용자의 권한 정보를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '내 권한 조회 성공',
    example: {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      role: 'user',
      permissions: [
        {
          resource: 'dashboard',
          permissions: ['read']
        }
      ]
    }
  })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async getMyPermissions(@Request() req): Promise<UserPermissions> {
    return this.permissionService.getUserPermissions(req.user.id);
  }

  @Get('check')
  @ApiOperation({
    summary: '권한 확인',
    description: '현재 사용자가 특정 리소스에 대한 특정 권한을 가지고 있는지 확인합니다.'
  })
  @ApiBody({
    type: PermissionCheckDto,
    description: '권한 확인 요청'
  })
  @ApiResponse({
    status: 200,
    description: '권한 확인 결과',
    example: {
      hasPermission: true
    }
  })
  @ApiBadRequestResponse({ description: '잘못된 요청 데이터' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async checkPermission(
    @Request() req,
    @Body() body: PermissionCheckDto
  ): Promise<PermissionCheckResponseDto> {
    const hasPermission = await this.permissionService.hasPermission(
      req.user.id,
      body.resource,
      body.permission
    );
    return { hasPermission };
  }

  @Get('menu-access/:menuKey')
  @ApiOperation({
    summary: '메뉴 접근 권한 확인',
    description: '현재 사용자가 특정 메뉴에 접근할 수 있는지 확인합니다.'
  })
  @ApiParam({
    name: 'menuKey',
    description: '메뉴 키',
    example: 'users'
  })
  @ApiResponse({
    status: 200,
    description: '메뉴 접근 권한 확인 결과',
    example: {
      hasAccess: true
    }
  })
  @ApiBadRequestResponse({ description: '잘못된 메뉴 키' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async checkMenuAccess(
    @Request() req,
    @Param('menuKey') menuKey: string
  ): Promise<MenuAccessResponseDto> {
    const hasAccess = await this.permissionService.hasMenuAccess(
      req.user.id,
      menuKey
    );
    return { hasAccess };
  }

  @Post('role-permissions')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.CREATE])
  @ApiOperation({
    summary: '역할 권한 생성',
    description: '새로운 역할 권한을 생성합니다. 관리자 권한이 필요합니다.'
  })
  @ApiBody({
    type: CreateRolePermissionDto,
    description: '생성할 역할 권한 정보'
  })
  @ApiResponse({
    status: 201,
    description: '역할 권한 생성 성공',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      role: 'admin',
      resource: 'users',
      permissions: ['create', 'read', 'update', 'delete'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  })
  @ApiBadRequestResponse({ description: '잘못된 요청 데이터' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async createRolePermission(
    @Body() rolePermission: CreateRolePermissionDto
  ): Promise<RolePermission> {
    return this.permissionService.createRolePermission(rolePermission);
  }

  @Put('role-permissions/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @ApiOperation({
    summary: '역할 권한 수정',
    description: '기존 역할 권한을 수정합니다.'
  })
  @ApiParam({
    name: 'id',
    description: '역할 권한 ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    type: CreateRolePermissionDto,
    description: '수정할 역할 권한 정보'
  })
  @ApiResponse({
    status: 200,
    description: '역할 권한 수정 성공',
    type: RolePermission
  })
  @ApiBadRequestResponse({ description: '잘못된 요청 데이터' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiNotFoundResponse({ description: '역할 권한을 찾을 수 없음' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async updateRolePermission(
    @Param('id') id: string,
    @Body() rolePermission: CreateRolePermissionDto
  ): Promise<RolePermission> {
    return this.permissionService.updateRolePermission(id, rolePermission);
  }

  @Delete('role-permissions/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.DELETE])
  @ApiOperation({
    summary: '역할 권한 삭제',
    description: '역할 권한을 삭제합니다.'
  })
  @ApiParam({
    name: 'id',
    description: '역할 권한 ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: '역할 권한 삭제 성공'
  })
  @ApiNotFoundResponse({ description: '역할 권한을 찾을 수 없음' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async deleteRolePermission(@Param('id') id: string): Promise<void> {
    return this.permissionService.deleteRolePermission(id);
  }

  @Get('role-permissions/:role')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @ApiOperation({
    summary: '특정 역할의 권한 조회',
    description: '특정 역할의 권한을 조회합니다.'
  })
  @ApiParam({
    name: 'role',
    description: '사용자 역할',
    enum: UserRole,
    example: UserRole.ADMIN
  })
  @ApiResponse({
    status: 200,
    description: '역할 권한 조회 성공',
    type: [RolePermission]
  })
  @ApiBadRequestResponse({ description: '잘못된 역할' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async getRolePermissions(
    @Param('role') role: UserRole
  ): Promise<RolePermission[]> {
    return this.permissionService.getRolePermissions(role);
  }

  @Get('role-permissions')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @ApiOperation({
    summary: '모든 역할 권한 조회',
    description: '시스템의 모든 역할 권한을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '역할 권한 목록 조회 성공',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        role: 'admin',
        resource: 'users',
        permissions: ['create', 'read', 'update', 'delete'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]
  })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async getAllRolePermissions(): Promise<RolePermission[]> {
    return this.permissionService.getAllRolePermissions();
  }

  @Post('initialize')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.MANAGE])
  @ApiOperation({
    summary: '기본 권한 초기화',
    description: '시스템의 기본 권한을 초기화합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '기본 권한 초기화 성공',
    example: {
      message: 'Default permissions initialized successfully'
    }
  })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async initializeDefaultPermissions(): Promise<{ message: string }> {
    await this.permissionService.initializeDefaultPermissions();
    return { message: 'Default permissions initialized successfully' };
  }

  @Get('roles')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @ApiOperation({
    summary: '모든 역할 조회',
    description: '시스템의 모든 역할을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '역할 목록 조회 성공',
    type: RoleListResponseDto,
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
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async getAllRoles(): Promise<RoleListResponseDto> {
    try {
      console.log('🔍 Getting all roles...');
      const roles = await this.permissionService.getAllRoles();
      console.log('✅ Roles fetched successfully:', roles.length);
      
      const mappedRoles = roles.map(role => {
        console.log('🔍 Mapping role:', role.name);
        return {
          id: role.id,
          name: role.name,
          description: role.description,
          isSystem: role.isSystem,
          permissions: [], // RolePermission은 별도로 관리되므로 빈 배열
          createdAt: role.createdAt as string,
          updatedAt: role.updatedAt as string
        };
      });
      
      console.log('✅ Mapped roles:', mappedRoles.length);
      return {
        roles: mappedRoles,
        total: roles.length
      };
    } catch (error) {
      console.error('❌ Error in getAllRoles:', error);
      throw error;
    }
  }

  @Get('roles/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @ApiOperation({
    summary: '특정 역할 조회',
    description: 'ID로 특정 역할을 조회합니다.'
  })
  @ApiParam({
    name: 'id',
    description: '역할 ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: '역할 조회 성공',
    type: RoleResponseDto,
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
  @ApiNotFoundResponse({ description: '역할을 찾을 수 없음' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async getRoleById(@Param('id') id: string): Promise<RoleResponseDto | null> {
    const role = await this.permissionService.getRoleById(id);
    if (!role) return null;
    
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      permissions: [], // RolePermission은 별도로 관리되므로 빈 배열
      createdAt: role.createdAt as string,
      updatedAt: role.updatedAt as string
    };
  }

  @Post('roles')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.CREATE])
  @ApiOperation({
    summary: '역할 생성',
    description: '새로운 역할을 생성합니다. 관리자 권한이 필요합니다.'
  })
  @ApiBody({
    type: CreateRoleDto,
    description: '생성할 역할 정보'
  })
  @ApiResponse({
    status: 201,
    description: '역할 생성 성공',
    type: RoleResponseDto,
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
  @ApiBadRequestResponse({ description: '잘못된 요청 데이터' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async createRole(@Body() role: CreateRoleDto): Promise<RoleResponseDto> {
    const createdRole = await this.permissionService.createRole(role);
    return {
      id: createdRole.id,
      name: createdRole.name,
      description: createdRole.description,
      isSystem: createdRole.isSystem,
      permissions: createdRole.permissions || [],
      createdAt: createdRole.createdAt as string,
      updatedAt: createdRole.updatedAt as string
    };
  }

  @Put('roles/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @ApiOperation({
    summary: '역할 수정',
    description: '기존 역할을 수정합니다.'
  })
  @ApiParam({
    name: 'id',
    description: '역할 ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    type: UpdateRoleDto,
    description: '수정할 역할 정보'
  })
  @ApiResponse({
    status: 200,
    description: '역할 수정 성공',
    type: RoleResponseDto,
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
  @ApiNotFoundResponse({ description: '역할을 찾을 수 없음' })
  @ApiBadRequestResponse({ description: '잘못된 요청 데이터' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async updateRole(
    @Param('id') id: string,
    @Body() role: UpdateRoleDto
  ): Promise<RoleResponseDto> {
    const updatedRole = await this.permissionService.updateRole(id, role);
    return {
      id: updatedRole.id,
      name: updatedRole.name,
      description: updatedRole.description,
      isSystem: updatedRole.isSystem,
      permissions: updatedRole.permissions || [],
      createdAt: updatedRole.createdAt as string,
      updatedAt: updatedRole.updatedAt as string
    };
  }

  @Delete('roles/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.DELETE])
  @ApiOperation({
    summary: '역할 삭제',
    description: '역할을 삭제합니다. 시스템 역할은 삭제할 수 없습니다.'
  })
  @ApiParam({
    name: 'id',
    description: '역할 ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: '역할 삭제 성공'
  })
  @ApiNotFoundResponse({ description: '역할을 찾을 수 없음' })
  @ApiBadRequestResponse({ description: '시스템 역할은 삭제할 수 없음' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async deleteRole(@Param('id') id: string): Promise<void> {
    return this.permissionService.deleteRole(id);
  }
}
