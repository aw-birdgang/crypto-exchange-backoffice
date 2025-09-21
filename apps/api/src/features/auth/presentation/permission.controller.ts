import {Body, Controller, Delete, Get, Inject, Param, Post, Put, Request, UseGuards,} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {AdminUserRole, Permission, Resource, UserPermissions,} from '@crypto-exchange/shared';
import {PermissionService} from '../application/services/permission.service';
import {
  CreateRoleDto,
  CreateRolePermissionDto,
  MenuAccessResponseDto,
  PermissionCheckDto,
  PermissionCheckResponseDto,
  RoleListResponseDto,
  RoleResponseDto,
  UpdateRoleDto
} from '../application/dto/permission.dto';
import {JwtAuthGuard} from './guards/jwt-auth.guard';
import {PermissionGuard, RequirePermissions,} from '../application/guards/permission.guard';
import {RolePermission} from '../domain/entities/role-permission.entity';
import {ApiBodyHelpers} from './constants/api-body.constants';
import {PermissionSwagger} from './swagger/permission.swagger';
import {ParseUuidPipe, RoleValidationPipe, TrimPipe, CustomValidationPipe} from '../../../common/pipes';

@ApiTags('Permissions')
@ApiBearerAuth('JWT-auth')
@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionController {
  constructor(
    @Inject(PermissionService)
    private permissionService: PermissionService,
  ) {}

  @Get('user/:userId')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @PermissionSwagger.getUserPermissions()
  async getUserPermissions(
    @Param('userId', ParseUuidPipe) userId: string
  ): Promise<UserPermissions> {
    return this.permissionService.getUserPermissions(userId);
  }

  @Get('my-permissions')
  @PermissionSwagger.getMyPermissions()
  async getMyPermissions(@Request() req: any): Promise<UserPermissions> {
    try {
      // 요청 검증
      if (!req.user || !req.user.id) {
        throw new Error('User information not found in request');
      }

      console.log('🔍 PermissionController: Getting my permissions for user:', {
        id: req.user.id,
        email: req.user.email,
        adminRole: req.user.adminRole
      });

      const permissions = await this.permissionService.getUserPermissions(req.user.id);

      console.log('✅ PermissionController: Successfully retrieved permissions:', {
        userId: permissions.userId,
        role: permissions.role,
        permissionsCount: permissions.permissions?.length || 0,
        resources: permissions.permissions?.map(p => p.resource) || []
      });

      return permissions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.error('❌ PermissionController: Error getting my permissions:', {
        userId: req.user?.id,
        error: errorMessage,
        stack: errorStack
      });

      // 에러 타입에 따른 HTTP 상태 코드 설정
      if (errorMessage.includes('User not found')) {
        throw new Error(`User not found: ${req.user.id}`);
      } else if (errorMessage.includes('Invalid userId')) {
        throw new Error('Invalid user ID provided');
      } else if (errorMessage.includes('Failed to retrieve permissions')) {
        throw new Error(`Failed to retrieve permissions for user: ${req.user.id}`);
      } else {
        throw new Error(`Unexpected error while getting user permissions: ${errorMessage}`);
      }
    }
  }

  @Get('check')
  @ApiBodyHelpers.permissionCheck()
  @PermissionSwagger.checkPermission()
  async checkPermission(
    @Request() req: any,
    @Body(TrimPipe, CustomValidationPipe) body: PermissionCheckDto
  ): Promise<PermissionCheckResponseDto> {
    const hasPermission = await this.permissionService.hasPermission(
      req.user.id,
      body.resource,
      body.permission
    );
    return { hasPermission };
  }

  @Get('menu-access/:menuKey')
  @PermissionSwagger.checkMenuAccess()
  async checkMenuAccess(
    @Request() req: any,
    @Param('menuKey', TrimPipe) menuKey: string
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
  @ApiBodyHelpers.createRolePermission()
  @PermissionSwagger.createRolePermission()
  async createRolePermission(
    @Body(TrimPipe, CustomValidationPipe) rolePermission: CreateRolePermissionDto
  ): Promise<RolePermission> {
    return this.permissionService.createRolePermission(rolePermission);
  }

  @Put('role-permissions/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @ApiBodyHelpers.createRolePermission()
  @PermissionSwagger.updateRolePermission()
  async updateRolePermission(
    @Param('id', ParseUuidPipe) id: string,
    @Body(TrimPipe, CustomValidationPipe) rolePermission: CreateRolePermissionDto
  ): Promise<RolePermission> {
    return this.permissionService.updateRolePermission(id, rolePermission);
  }

  @Delete('role-permissions/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.DELETE])
  @PermissionSwagger.deleteRolePermission()
  async deleteRolePermission(@Param('id', ParseUuidPipe) id: string): Promise<void> {
    return this.permissionService.deleteRolePermission(id);
  }

  @Get('role-permissions/:role')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @PermissionSwagger.getRolePermissions()
  async getRolePermissions(
    @Param('role', RoleValidationPipe) role: AdminUserRole
  ): Promise<RolePermission[]> {
    return this.permissionService.getRolePermissions(role);
  }

  @Get('role-permissions')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @PermissionSwagger.getAllRolePermissions()
  async getAllRolePermissions(): Promise<RolePermission[]> {
    return this.permissionService.getAllRolePermissions();
  }

  @Post('initialize')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.MANAGE])
  @PermissionSwagger.initializeDefaultPermissions()
  async initializeDefaultPermissions(): Promise<{ message: string }> {
    await this.permissionService.initializeDefaultPermissions();
    return { message: 'Default permissions initialized successfully' };
  }

  @Get('roles')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @PermissionSwagger.getAllRoles()
  async getAllRoles(): Promise<RoleListResponseDto> {
    try {
      console.log('🔍 Getting all roles...');
      const roles = await this.permissionService.getAllRoles();
      console.log('✅ Roles fetched successfully:', roles.roles.length);

      console.log('✅ Mapped roles:', roles.roles.length);
    return roles;
    } catch (error) {
      console.error('❌ Error in getAllRoles:', error);
      throw error;
    }
  }

  @Get('roles/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.READ])
  @PermissionSwagger.getRoleById()
  async getRoleById(@Param('id', ParseUuidPipe) id: string): Promise<RoleResponseDto | null> {
    const role = await this.permissionService.getRoleById(id);
    if (!role) return null;

    return role;
  }

  @Post('roles')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.CREATE])
  @ApiBodyHelpers.createRole()
  @PermissionSwagger.createRole()
  async createRole(@Body(TrimPipe, CustomValidationPipe) role: CreateRoleDto): Promise<RoleResponseDto> {
    console.log('🔍 CreateRole - Raw body received:', JSON.stringify(role, null, 2));
    console.log('🔍 CreateRole - Body type:', typeof role);
    console.log('🔍 CreateRole - Body keys:', Object.keys(role));

    try {
      const createdRole = await this.permissionService.createRole(role);
      console.log('✅ CreateRole - Successfully created role:', JSON.stringify(createdRole, null, 2));

    return createdRole;
    } catch (error) {
      console.error('❌ CreateRole - Error creating role:', error);
      throw error;
    }
  }

  @Put('roles/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.UPDATE])
  @ApiBodyHelpers.updateRole()
  @PermissionSwagger.updateRole()
  async updateRole(
    @Param('id', ParseUuidPipe) id: string,
    @Body(TrimPipe, CustomValidationPipe) role: UpdateRoleDto
  ): Promise<RoleResponseDto> {
    const updatedRole = await this.permissionService.updateRole(id, role);
    return updatedRole;
  }

  @Delete('roles/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Resource.SETTINGS, [Permission.DELETE])
  @PermissionSwagger.deleteRole()
  async deleteRole(@Param('id', ParseUuidPipe) id: string): Promise<void> {
    return this.permissionService.deleteRole(id);
  }
}
