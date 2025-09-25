import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { PermissionController } from './permission.controller';
import { AdminController } from './admin.controller';
import { AuthService } from '../application/services/auth.service';
import { PermissionService } from '../application/services/permission.service';
import { AdminService } from '../application/services/admin.service';
import { AdminUser } from '../domain/entities/admin-user.entity';
import { RolePermission } from '../domain/entities/role-permission.entity';
import { Role } from '../domain/entities/role.entity';
import { PermissionRepository } from '../infrastructure/repositories/permission.repository';
import { AdminUserRepository } from '../infrastructure/repositories/admin-user.repository';
import { RoleRepository } from '../infrastructure/repositories/role.repository';
import { PermissionRepositoryInterface } from '../domain/repositories/permission.repository.interface';
import { AdminUserRepositoryInterface } from '../domain/repositories/admin-user.repository.interface';
import { RoleRepositoryInterface } from '../domain/repositories/role.repository.interface';
import { JwtStrategy } from '../application/strategies/jwt.strategy';
import { mapperProviders } from '../application/providers/mapper.providers';
import { AuditLogModule } from '../../audit-log/presentation/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser, RolePermission, Role]),
    PassportModule,
    JwtModule,
    AuditLogModule,
  ],
  controllers: [AuthController, PermissionController, AdminController],
  providers: [
    AuthService,
    PermissionService,
    AdminService,
    JwtStrategy,
    ...mapperProviders,
    {
      provide: 'PermissionRepositoryInterface',
      useClass: PermissionRepository,
    },
    {
      provide: 'AdminUserRepositoryInterface',
      useClass: AdminUserRepository,
    },
    {
      provide: 'RoleRepositoryInterface',
      useClass: RoleRepository,
    },
  ],
  exports: [AuthService, PermissionService, AdminService, 'PermissionRepositoryInterface', 'AdminUserRepositoryInterface', 'RoleRepositoryInterface'],
})
export class AuthModule {}
