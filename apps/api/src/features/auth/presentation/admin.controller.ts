import {Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards, BadRequestException} from '@nestjs/common';
import {ApiBearerAuth, ApiTags,} from '@nestjs/swagger';
import {AdminService} from '../application/services/admin.service';
import {
  AdminBulkActionDto,
  AdminDashboardDto,
  AdminStatsDto,
  CreateAdminDto,
  UpdateAdminDto,
} from '../application/dto/admin.dto';
import {AdminUserResponseDto,} from '../application/dto/permission.dto';
import {JwtAuthGuard} from './guards/jwt-auth.guard';
import {PermissionGuard, RequirePermissions} from '../application/guards/permission.guard';
import {AdminUserRole, Permission, Resource} from '@crypto-exchange/shared';
import {AdminUser} from '@/features/auth/domain/entities/admin-user.entity';
import {ApiBodyHelpers} from './constants/api-body.constants';
import {AdminSwagger} from './swagger/admin.swagger';
import {ParseUuidPipe, ParseBooleanPipe, ParseIntPipe, TrimPipe, CustomValidationPipe} from '../../../common/pipes';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}


  @Get('dashboard')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.DASHBOARD, [Permission.READ])
  @AdminSwagger.getDashboard()
  async getDashboard(): Promise<AdminDashboardDto> {
    return this.adminService.getAdminDashboard();
  }

  @Get('stats')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.DASHBOARD, [Permission.READ])
  @AdminSwagger.getStats()
  async getStats(): Promise<AdminStatsDto> {
    return this.adminService.getAdminStats();
  }

  @Get('admins')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @AdminSwagger.getAllAdmins()
  async getAllAdmins(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC'
  ): Promise<{ adminUsers: AdminUser[]; total: number; page: number; limit: number }> {
    // 파라미터가 없거나 빈 문자열인 경우 기본값 사용
    const pageNum = (page && page !== '') ? parseInt(page, 10) : 1;
    const limitNum = (limit && limit !== '') ? parseInt(limit, 10) : 10;
    const sortByValue = sortBy || 'createdAt';
    const sortOrderValue = sortOrder || 'DESC';
    
    // 유효성 검사 (NaN 체크 제거하고 기본값 사용)
    const finalPageNum = isNaN(pageNum) ? 1 : Math.max(1, pageNum);
    const finalLimitNum = isNaN(limitNum) ? 10 : Math.min(100, Math.max(1, limitNum));
    
    const result = await this.adminService.getAllAdminsWithPagination(finalPageNum, finalLimitNum, sortByValue, sortOrderValue);
    return {
      ...result,
      page: finalPageNum,
      limit: finalLimitNum
    };
  }

  @Post('admins')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.CREATE])
  @ApiBodyHelpers.createAdmin()
  @AdminSwagger.createAdmin()
  async createAdmin(@Body(TrimPipe, CustomValidationPipe) adminData: CreateAdminDto): Promise<AdminUser> {
    return this.adminService.createAdmin(adminData);
  }

  @Put('admins/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @ApiBodyHelpers.updateAdmin()
  @AdminSwagger.updateAdmin()
  async updateAdmin(
    @Param('id', ParseUuidPipe) id: string,
    @Body(TrimPipe, CustomValidationPipe) adminData: UpdateAdminDto,
  ): Promise<AdminUserResponseDto> {
    return this.adminService.updateAdmin(id, adminData);
  }

  @Delete('admins/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.DELETE])
  @AdminSwagger.deleteAdmin()
  async deleteAdmin(@Param('id', ParseUuidPipe) id: string): Promise<{ message: string }> {
    await this.adminService.deleteAdmin(id);
    return { message: '관리자가 삭제되었습니다.' };
  }

  @Post('users/bulk-action')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.MANAGE])
  @ApiBodyHelpers.bulkAction()
  @AdminSwagger.bulkUserAction()
  async bulkUserAction(@Body(TrimPipe, CustomValidationPipe) actionData: AdminBulkActionDto): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    return this.adminService.bulkAdminAction(actionData);
  }

  @Get('permissions/check')
  @AdminSwagger.checkPermission()
  async checkPermission(
    @Request() req: any,
    @Query('resource', TrimPipe) resource: Resource,
    @Query('permission', TrimPipe) permission: Permission,
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
  @ApiBodyHelpers.updateAdmin()
  @AdminSwagger.updateUserAsAdmin()
  async updateUserAsAdmin(
    @Param('id', ParseUuidPipe) id: string,
    @Body(TrimPipe, CustomValidationPipe) adminData: UpdateAdminDto,
    @Request() req: any,
  ): Promise<AdminUserResponseDto> {
    return this.adminService.updateAdmin(id, adminData);
  }

  @Delete('users/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.DELETE])
  @AdminSwagger.deleteUser()
  async deleteUserAsAdmin(
    @Param('id', ParseUuidPipe) id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.adminService.deleteAdmin(id);
    return { message: '사용자가 삭제되었습니다.' };
  }

  @Get('users/pending')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @AdminSwagger.getPendingUsers()
  async getPendingUsers(): Promise<AdminUser[]> {
    return this.adminService.getPendingUsers();
  }

  @Put('users/:id/approve')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @AdminSwagger.approveUser()
  async approveUser(
    @Param('id', ParseUuidPipe) id: string,
    @Body(TrimPipe, CustomValidationPipe) approvalData: { role: AdminUserRole; isActive: boolean },
    @Request() req: any,
  ): Promise<AdminUser> {
    return this.adminService.approveUser(id, approvalData, req.user.id);
  }

  @Put('users/:id/reject')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @AdminSwagger.rejectUser()
  async rejectUser(
    @Param('id', ParseUuidPipe) id: string,
    @Request() req: any,
  ): Promise<AdminUser> {
    return this.adminService.rejectUser(id, req.user.id);
  }

  @Get('users/status/:status')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @AdminSwagger.getPendingUsers()
  async getUsersByStatus(
    @Param('status', TrimPipe) status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED',
  ): Promise<AdminUser[]> {
    return this.adminService.getUsersByStatus(status);
  }

  @Put('users/:id/activate')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @AdminSwagger.activateUser()
  async activateUser(
    @Param('id', ParseUuidPipe) id: string,
    @Request() req: any,
  ): Promise<AdminUser> {
    return this.adminService.activateUser(id, req.user.id);
  }

  @Put('users/:id/deactivate')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @AdminSwagger.deactivateUser()
  async deactivateUser(
    @Param('id', ParseUuidPipe) id: string,
    @Request() req: any,
  ): Promise<AdminUser> {
    return this.adminService.deactivateUser(id, req.user.id);
  }

  @Put('users/:id/suspend')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @AdminSwagger.suspendUser()
  async suspendUser(
    @Param('id', ParseUuidPipe) id: string,
    @Body(TrimPipe, CustomValidationPipe) suspendData: { reason: string },
    @Request() req: any,
  ): Promise<AdminUser> {
    return this.adminService.suspendUser(id, suspendData.reason, req.user.id);
  }

  @Put('users/:id/unsuspend')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @AdminSwagger.unsuspendUser()
  async unsuspendUser(
    @Param('id', ParseUuidPipe) id: string,
    @Request() req: any,
  ): Promise<AdminUser> {
    return this.adminService.unsuspendUser(id, req.user.id);
  }
}
