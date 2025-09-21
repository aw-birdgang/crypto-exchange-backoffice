import {Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards} from '@nestjs/common';
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
  async getAllAdmins(): Promise<AdminUser[]> {
    return this.adminService.getAllAdmins();
  }

  @Post('admins')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.CREATE])
  @ApiBodyHelpers.createAdmin()
  @AdminSwagger.createAdmin()
  async createAdmin(@Body() adminData: CreateAdminDto): Promise<AdminUser> {
    return this.adminService.createAdmin(adminData);
  }

  @Put('admins/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @ApiBodyHelpers.updateAdmin()
  @AdminSwagger.updateAdmin()
  async updateAdmin(
    @Param('id') id: string,
    @Body() adminData: UpdateAdminDto,
  ): Promise<AdminUserResponseDto> {
    return this.adminService.updateAdmin(id, adminData);
  }

  @Delete('admins/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.DELETE])
  @AdminSwagger.deleteAdmin()
  async deleteAdmin(@Param('id') id: string): Promise<{ message: string }> {
    await this.adminService.deleteAdmin(id);
    return { message: '관리자가 삭제되었습니다.' };
  }

  @Post('users/bulk-action')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.MANAGE])
  @ApiBodyHelpers.bulkAction()
  @AdminSwagger.bulkUserAction()
  async bulkUserAction(@Body() actionData: AdminBulkActionDto): Promise<{
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
  @ApiBodyHelpers.updateAdmin()
  @AdminSwagger.updateUserAsAdmin()
  async updateUserAsAdmin(
    @Param('id') id: string,
    @Body() adminData: UpdateAdminDto,
    @Request() req: any,
  ): Promise<AdminUserResponseDto> {
    return this.adminService.updateAdmin(id, adminData);
  }

  @Delete('users/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.DELETE])
  @AdminSwagger.deleteUser()
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
  @AdminSwagger.getPendingUsers()
  async getPendingUsers(): Promise<AdminUser[]> {
    return this.adminService.getPendingUsers();
  }

  @Put('users/:id/approve')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @AdminSwagger.approveUser()
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
  @AdminSwagger.rejectUser()
  async rejectUser(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<AdminUser> {
    return this.adminService.rejectUser(id, req.user.id);
  }

  @Get('users/status/:status')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @AdminSwagger.getPendingUsers()
  async getUsersByStatus(
    @Param('status') status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED',
  ): Promise<AdminUser[]> {
    return this.adminService.getUsersByStatus(status);
  }
}
