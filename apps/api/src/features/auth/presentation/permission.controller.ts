import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole, Resource, Permission, UserPermissions } from '@crypto-exchange/shared';
import { PermissionService } from '../application/services/permission.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionGuard, RequirePermissions } from '../application/guards/permission.guard';
import { RolePermission } from '../domain/entities/role-permission.entity';

@ApiTags('Permissions')
@ApiBearerAuth('JWT-auth')
@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionController {
  constructor(
    @Inject('PermissionRepositoryInterface')
    private permissionService: PermissionService,
  ) {}

  @Get('user/:userId')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.USERS, [Permission.READ])
  async getUserPermissions(@Param('userId') userId: string): Promise<UserPermissions> {
    return this.permissionService.getUserPermissions(userId);
  }

  @Get('my-permissions')
  async getMyPermissions(@Request() req): Promise<UserPermissions> {
    return this.permissionService.getUserPermissions(req.user.id);
  }

  @Get('check')
  async checkPermission(
    @Request() req,
    @Body() body: { resource: Resource; permission: Permission },
  ): Promise<{ hasPermission: boolean }> {
    const hasPermission = await this.permissionService.hasPermission(
      req.user.id,
      body.resource,
      body.permission,
    );
    return { hasPermission };
  }

  @Get('menu-access/:menuKey')
  async checkMenuAccess(
    @Request() req,
    @Param('menuKey') menuKey: string,
  ): Promise<{ hasAccess: boolean }> {
    const hasAccess = await this.permissionService.hasMenuAccess(req.user.id, menuKey);
    return { hasAccess };
  }

  @Post('role-permissions')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.CREATE])
  async createRolePermission(@Body() rolePermission: Partial<RolePermission>): Promise<RolePermission> {
    return this.permissionService.createRolePermission(rolePermission);
  }

  @Put('role-permissions/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  async updateRolePermission(
    @Param('id') id: string,
    @Body() rolePermission: Partial<RolePermission>,
  ): Promise<RolePermission> {
    return this.permissionService.updateRolePermission(id, rolePermission);
  }

  @Delete('role-permissions/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.DELETE])
  async deleteRolePermission(@Param('id') id: string): Promise<void> {
    return this.permissionService.deleteRolePermission(id);
  }

  @Get('role-permissions/:role')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  async getRolePermissions(@Param('role') role: UserRole): Promise<RolePermission[]> {
    return this.permissionService.getRolePermissions(role);
  }

  @Get('role-permissions')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  async getAllRolePermissions(): Promise<RolePermission[]> {
    return this.permissionService.getAllRolePermissions();
  }

  @Post('initialize')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.MANAGE])
  async initializeDefaultPermissions(): Promise<{ message: string }> {
    await this.permissionService.initializeDefaultPermissions();
    return { message: 'Default permissions initialized successfully' };
  }
}
