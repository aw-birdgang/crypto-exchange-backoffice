import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { PermissionController } from './permission.controller';
import { AuthService } from '../application/services/auth.service';
import { PermissionService } from '../application/services/permission.service';
import { SeedService } from '../application/services/seed.service';
import { InitializationService } from '../application/services/initialization.service';
import { User } from '../domain/entities/user.entity';
import { RolePermission } from '../domain/entities/role-permission.entity';
import { PermissionRepository } from '../infrastructure/repositories/permission.repository';
import { PermissionRepositoryInterface } from '../domain/repositories/permission.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RolePermission]),
    PassportModule,
    JwtModule,
  ],
  controllers: [AuthController, PermissionController],
  providers: [
    AuthService,
    PermissionService,
    SeedService,
    InitializationService,
    {
      provide: 'PermissionRepositoryInterface',
      useClass: PermissionRepository,
    },
  ],
  exports: [AuthService, PermissionService, 'PermissionRepositoryInterface'],
})
export class AuthModule {}
