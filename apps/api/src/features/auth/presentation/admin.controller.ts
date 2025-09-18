import {Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards,} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {AdminService} from '../application/services/admin.service';
import {
  AdminBulkActionDto,
  AdminDashboardDto,
  AdminStatsDto,
  CreateAdminDto,
  UpdateAdminDto,
} from '../application/dto/admin.dto';
import {CreateUserDto, UpdateUserDto, UserResponseDto,} from '../application/dto/permission.dto';
import {JwtAuthGuard} from './guards/jwt-auth.guard';
import {PermissionGuard, RequirePermissions} from '../application/guards/permission.guard';
import {Permission, Resource, UserRole} from '@crypto-exchange/shared';
import {AdminUser, AdminRole} from '@/features/auth/domain/entities/admin-user.entity';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * AdminRole을 UserRole로 매핑
   */
  private mapAdminRoleToUserRole(adminRole: AdminRole): UserRole {
    switch (adminRole) {
      case AdminRole.SUPER_ADMIN:
        return UserRole.SUPER_ADMIN;
      case AdminRole.ADMIN:
        return UserRole.ADMIN;
      default:
        return UserRole.USER;
    }
  }

  @Get('dashboard')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.DASHBOARD, [Permission.READ])
  @ApiOperation({
    summary: '관리자 대시보드',
    description: '관리자 대시보드 데이터를 조회합니다. 시스템 통계, 최근 활동, 시스템 상태를 포함합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '대시보드 데이터 조회 성공',
    type: AdminDashboardDto,
    example: {
      stats: {
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
          trader: 15
        }
      },
      recentActivities: [
        {
          id: '1',
          action: 'USER_CREATED',
          user: 'admin@crypto-exchange.com',
          timestamp: '2024-01-01T10:00:00.000Z',
          details: 'Created new user'
        }
      ],
      systemStatus: {
        database: 'healthy',
        redis: 'healthy',
        api: 'healthy'
      }
    }
  })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async getDashboard(): Promise<AdminDashboardDto> {
    return this.adminService.getAdminDashboard();
  }

  @Get('stats')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.DASHBOARD, [Permission.READ])
  @ApiOperation({
    summary: '시스템 통계',
    description: '시스템 사용자 통계를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '통계 조회 성공',
    type: AdminStatsDto,
    example: {
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
        trader: 15
      }
    }
  })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async getStats(): Promise<AdminStatsDto> {
    return this.adminService.getAdminStats();
  }

  @Get('admins')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @ApiOperation({
    summary: '관리자 목록 조회',
    description: '모든 관리자 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '관리자 목록 조회 성공',
    type: [AdminUser],
    example: [
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
    ]
  })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async getAllAdmins(): Promise<AdminUser[]> {
    return this.adminService.getAllAdmins();
  }

  @Post('admins')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.CREATE])
  @ApiOperation({
    summary: '관리자 생성',
    description: '새로운 관리자를 생성합니다. SUPER_ADMIN 권한이 필요합니다.',
  })
  @ApiBody({
    type: CreateAdminDto,
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
  @ApiResponse({
    status: 201,
    description: '관리자 생성 성공',
    type: AdminUser,
    example: {
      id: 'cmfkr31v7000wcm9urdbekf4u',
      email: 'admin@crypto-exchange.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      adminRole: 'ADMIN',
      permissions: ['users:read', 'users:create', 'users:update'],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  })
  @ApiBadRequestResponse({ description: '잘못된 요청 데이터 또는 이미 존재하는 이메일' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async createAdmin(@Body() adminData: CreateAdminDto): Promise<AdminUser> {
    return this.adminService.createAdmin(adminData);
  }

  @Put('admins/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @ApiOperation({
    summary: '관리자 정보 수정',
    description: '관리자의 정보를 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '관리자 ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    type: UpdateAdminDto,
    description: '수정할 관리자 정보'
  })
  @ApiResponse({
    status: 200,
    description: '관리자 정보 수정 성공',
    type: AdminUser,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'updated-admin@crypto-exchange.com',
      firstName: 'Updated Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  })
  @ApiBadRequestResponse({ description: '잘못된 요청 데이터' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiNotFoundResponse({ description: '관리자를 찾을 수 없음' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async updateAdmin(
    @Param('id') id: string,
    @Body() adminData: UpdateAdminDto,
  ): Promise<AdminUser> {
    return this.adminService.updateAdmin(id, adminData);
  }

  @Delete('admins/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.DELETE])
  @ApiOperation({
    summary: '관리자 삭제',
    description: '관리자를 삭제합니다. SUPER_ADMIN 권한이 필요합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '관리자 ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: '관리자 삭제 성공',
    example: {
      message: '관리자가 삭제되었습니다.'
    }
  })
  @ApiBadRequestResponse({ description: '잘못된 관리자 ID' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiNotFoundResponse({ description: '관리자를 찾을 수 없음' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async deleteAdmin(@Param('id') id: string): Promise<{ message: string }> {
    await this.adminService.deleteAdmin(id);
    return { message: '관리자가 삭제되었습니다.' };
  }

  @Post('users/bulk-action')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.MANAGE])
  @ApiOperation({
    summary: '대량 사용자 작업',
    description: '여러 사용자에 대해 대량 작업을 수행합니다. (활성화, 비활성화, 삭제, 역할 변경)',
  })
  @ApiBody({
    type: AdminBulkActionDto,
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
  @ApiResponse({
    status: 200,
    description: '대량 작업 완료',
    example: {
      success: 2,
      failed: 1,
      errors: ['사용자 ID user3를 찾을 수 없습니다.']
    }
  })
  @ApiBadRequestResponse({ description: '잘못된 요청 데이터' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async bulkUserAction(@Body() actionData: AdminBulkActionDto): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    return this.adminService.bulkAdminAction(actionData);
  }

  @Get('permissions/check')
  @ApiOperation({
    summary: '관리자 권한 확인',
    description: '현재 관리자의 특정 권한을 확인합니다.',
  })
  @ApiQuery({
    name: 'resource',
    description: '리소스',
    enum: Resource,
    example: Resource.DASHBOARD
  })
  @ApiQuery({
    name: 'permission',
    description: '권한',
    enum: Permission,
    example: Permission.CREATE
  })
  @ApiResponse({
    status: 200,
    description: '권한 확인 결과',
    example: {
      hasPermission: true
    }
  })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async checkPermission(
    @Request() req,
    @Query('resource') resource: Resource,
    @Query('permission') permission: Permission,
  ): Promise<{ hasPermission: boolean }> {
    const hasPermission = await this.adminService.checkAdminPermission(
      req.user.id,
      resource,
      permission,
    );
    return { hasPermission };
  }

  @Post('users')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.CREATE])
  @ApiOperation({
    summary: '관리자 권한으로 사용자 생성',
    description: '관리자 권한으로 새로운 사용자를 생성합니다.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: '생성할 사용자 정보',
    examples: {
      example1: {
        summary: '일반 사용자 생성',
        value: {
          email: 'user@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          isActive: true
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: '사용자 생성 성공',
    type: UserResponseDto
  })
  @ApiBadRequestResponse({ description: '잘못된 요청 데이터' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async createUserAsAdmin(
    @Body() userData: CreateUserDto,
    @Request() req,
  ): Promise<UserResponseDto> {
    // CreateUserDto를 CreateAdminDto로 변환
    const adminData: CreateAdminDto = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role === UserRole.SUPER_ADMIN ? UserRole.SUPER_ADMIN : UserRole.ADMIN,
      isActive: userData.isActive
    };
    
    const createdUser = await this.adminService.createAdmin(adminData);
    return {
      id: createdUser.id,
      email: createdUser.email,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      role: this.mapAdminRoleToUserRole(createdUser.adminRole),
      isActive: createdUser.isActive,
      lastLoginAt: createdUser.lastLoginAt?.toISOString() || '',
      createdAt: createdUser.createdAt.toISOString(),
      updatedAt: createdUser.updatedAt.toISOString()
    };
  }

  @Put('users/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @ApiOperation({
    summary: '관리자 권한으로 사용자 수정',
    description: '관리자 권한으로 사용자 정보를 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '사용자 ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    type: UpdateUserDto,
    description: '수정할 사용자 정보'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 수정 성공',
    type: UserResponseDto
  })
  @ApiBadRequestResponse({ description: '잘못된 요청 데이터' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiNotFoundResponse({ description: '사용자를 찾을 수 없음' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async updateUserAsAdmin(
    @Param('id') id: string,
    @Body() userData: UpdateUserDto,
    @Request() req,
  ): Promise<UserResponseDto> {
    // UpdateUserDto를 UpdateAdminDto로 변환
    const adminData: UpdateAdminDto = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role === UserRole.SUPER_ADMIN ? UserRole.SUPER_ADMIN : UserRole.ADMIN,
      isActive: userData.isActive
    };
    
    const updatedUser = await this.adminService.updateAdmin(id, adminData);
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: this.mapAdminRoleToUserRole(updatedUser.adminRole),
      isActive: updatedUser.isActive,
      lastLoginAt: updatedUser.lastLoginAt?.toISOString() || '',
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString()
    };
  }

  @Delete('users/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.DELETE])
  @ApiOperation({
    summary: '관리자 권한으로 사용자 삭제',
    description: '관리자 권한으로 사용자를 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '사용자 ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 삭제 성공',
    example: {
      message: '사용자가 삭제되었습니다.'
    }
  })
  @ApiBadRequestResponse({ description: '잘못된 사용자 ID' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiNotFoundResponse({ description: '사용자를 찾을 수 없음' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async deleteUserAsAdmin(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    await this.adminService.deleteAdmin(id);
    return { message: '사용자가 삭제되었습니다.' };
  }
}
