import {Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards,} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import {Permission, Resource, AdminUserRole} from '@crypto-exchange/shared';
import {AdminUser} from '@/features/auth/domain/entities/admin-user.entity';
import { ApiBodyHelpers } from './constants/api-body.constants';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}


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
  @ApiBodyHelpers.createAdmin()
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
  @ApiBodyHelpers.updateAdmin()
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
  @ApiBodyHelpers.bulkAction()
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
    @Request() req: any,
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


  @Put('users/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @ApiOperation({
    summary: '승인된 사용자 정보 수정',
    description: '이미 승인된 사용자의 정보를 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '사용자 ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBodyHelpers.updateUser()
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
    @Request() req: any,
  ): Promise<UserResponseDto> {
    // UpdateUserDto를 UpdateAdminDto로 변환
    const adminData: UpdateAdminDto = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role === AdminUserRole.SUPER_ADMIN ? AdminUserRole.SUPER_ADMIN : AdminUserRole.ADMIN,
      isActive: userData.isActive
    };

    const updatedUser = await this.adminService.updateAdmin(id, adminData);
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.adminRole,
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
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.adminService.deleteAdmin(id);
    return { message: '사용자가 삭제되었습니다.' };
  }

  @Get('users/pending')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @ApiOperation({
    summary: '대기 중인 사용자 목록 조회',
    description: '승인 대기 중인 사용자 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '대기 중인 사용자 목록 조회 성공',
    type: [AdminUser]
  })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  async getPendingUsers(): Promise<AdminUser[]> {
    return this.adminService.getPendingUsers();
  }

  @Put('users/:id/approve')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @ApiOperation({
    summary: '사용자 승인',
    description: '대기 중인 사용자를 승인하고 역할을 부여합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '사용자 ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 승인 성공',
    type: AdminUser
  })
  @ApiBadRequestResponse({ description: '잘못된 요청 데이터' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiNotFoundResponse({ description: '사용자를 찾을 수 없음' })
  async approveUser(
    @Param('id') id: string,
    @Body() approvalData: { role: AdminUserRole; isActive: boolean },
    @Request() req: any,
  ): Promise<AdminUser> {
    return this.adminService.approveUser(id, approvalData, req.user.id);
  }

  @Put('users/:id/reject')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @ApiOperation({
    summary: '사용자 거부',
    description: '대기 중인 사용자의 가입을 거부합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '사용자 ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 거부 성공',
    type: AdminUser
  })
  @ApiBadRequestResponse({ description: '잘못된 요청 데이터' })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  @ApiNotFoundResponse({ description: '사용자를 찾을 수 없음' })
  async rejectUser(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<AdminUser> {
    return this.adminService.rejectUser(id, req.user.id);
  }

  @Get('users/status/:status')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @ApiOperation({
    summary: '상태별 사용자 목록 조회',
    description: '특정 상태의 사용자 목록을 조회합니다.',
  })
  @ApiParam({
    name: 'status',
    description: '사용자 상태',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
    example: 'PENDING'
  })
  @ApiResponse({
    status: 200,
    description: '상태별 사용자 목록 조회 성공',
    type: [AdminUser]
  })
  @ApiUnauthorizedResponse({ description: '인증되지 않은 사용자' })
  @ApiForbiddenResponse({ description: '권한이 없는 사용자' })
  async getUsersByStatus(
    @Param('status') status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED',
  ): Promise<AdminUser[]> {
    return this.adminService.getUsersByStatus(status);
  }
}
