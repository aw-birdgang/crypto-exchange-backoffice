import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from '../application/services/admin.service';
import { AdminUser } from '../domain/entities/admin-user.entity';
import { AdminUserRepository } from '../infrastructure/repositories/admin-user.repository';
import { PermissionService } from '../application/services/permission.service';
import { PermissionRepository } from '../infrastructure/repositories/permission.repository';
import { RolePermission } from '../domain/entities/role-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser, RolePermission]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    {
      provide: 'AdminUserRepositoryInterface',
      useClass: AdminUserRepository,
    },
    {
      provide: 'PermissionRepositoryInterface',
      useClass: PermissionRepository,
    },
    PermissionService,
  ],
  exports: [AdminService],
})
export class AdminModule {}
