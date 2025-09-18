import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser, AdminRole } from '../../domain/entities/admin-user.entity';
import { RolePermission } from '../../domain/entities/role-permission.entity';
import { Role } from '../../domain/entities/role.entity';
import { UserRole, Resource, Permission } from '@crypto-exchange/shared';
import * as bcrypt from 'bcrypt';
import { APP_CONSTANTS } from '@crypto-exchange/shared';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async seedDatabase(): Promise<void> {
    console.log('🌱 Starting database seeding...');
    
    try {
      await this.seedRoles();
      console.log('✅ Roles seeding completed');
    } catch (error) {
      console.error('❌ Roles seeding failed:', error);
    }
    
    try {
      await this.seedAdminUsers();
      console.log('✅ Admin users seeding completed');
    } catch (error) {
      console.error('❌ Admin users seeding failed:', error);
    }
    
    try {
      await this.seedRolePermissions();
      console.log('✅ Role permissions seeding completed');
    } catch (error) {
      console.error('❌ Role permissions seeding failed:', error);
    }
    
    console.log('✅ Database seeding completed!');
  }

  private async seedRoles(): Promise<void> {
    console.log('🎭 Seeding roles...');
    
    const roles = [
      {
        name: 'super_admin',
        description: '최고 관리자 - 모든 권한을 가진 시스템 관리자',
        isSystem: true,
      },
      {
        name: 'admin',
        description: '관리자 - 시스템 관리 권한을 가진 관리자',
        isSystem: true,
      },
      {
        name: 'moderator',
        description: '모더레이터 - 콘텐츠 관리 권한을 가진 사용자',
        isSystem: false,
      },
      {
        name: 'support',
        description: '고객 지원 - 고객 지원 업무를 담당하는 사용자',
        isSystem: false,
      },
      {
        name: 'auditor',
        description: '감사자 - 시스템 감사 및 보안 검토를 담당하는 사용자',
        isSystem: false,
      },
    ];

    for (const roleData of roles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
        console.log(`✅ Role created: ${roleData.name}`);
      } else {
        console.log(`✅ Role already exists: ${roleData.name}`);
      }
    }
  }

  private async seedAdminUsers(): Promise<void> {
    console.log('👑 Seeding admin users...');
    
    const adminUsers = [
      {
        email: 'superadmin@crypto-exchange.com',
        username: 'superadmin',
        firstName: 'Super',
        lastName: 'Admin',
        adminRole: AdminRole.SUPER_ADMIN,
        permissions: [
          'users:read', 'users:create', 'users:update', 'users:delete',
          'system:configure', 'notifications:read', 'notifications:create', 
          'notifications:delete', 'logs:read', 'system:restart', 
          'cache:manage', 'database:manage', 'roles:manage', 
          'permissions:assign', 'users:change_role', 'audit:read',
          'system:backup', 'system:restore', 'security:manage'
        ],
        password: 'superadmin123!'
      },
      {
        email: 'admin@crypto-exchange.com',
        username: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        adminRole: AdminRole.ADMIN,
        permissions: [
          'users:read', 'users:create', 'users:update', 'users:suspend',
          'users:ban', 'users:change_role', 'system:configure',
          'notifications:read', 'notifications:create', 'notifications:delete',
          'logs:read', 'cache:manage', 'audit:read'
        ],
        password: 'admin123!'
      },
      {
        email: 'moderator@crypto-exchange.com',
        username: 'moderator',
        firstName: 'Content',
        lastName: 'Moderator',
        adminRole: AdminRole.MODERATOR,
        permissions: [
          'users:read', 'users:suspend', 'users:ban',
          'notifications:read', 'notifications:create',
          'logs:read', 'content:moderate', 'reports:read'
        ],
        password: 'moderator123!'
      },
      {
        email: 'support@crypto-exchange.com',
        username: 'support',
        firstName: 'Customer',
        lastName: 'Support',
        adminRole: AdminRole.SUPPORT,
        permissions: [
          'users:read', 'users:update',
          'notifications:read', 'notifications:create',
          'tickets:read', 'tickets:update', 'tickets:close',
          'reports:read'
        ],
        password: 'support123!'
      },
      {
        email: 'auditor@crypto-exchange.com',
        username: 'auditor',
        firstName: 'Security',
        lastName: 'Auditor',
        adminRole: AdminRole.AUDITOR,
        permissions: [
          'audit:read', 'logs:read', 'security:audit',
          'reports:read', 'compliance:check'
        ],
        password: 'auditor123!'
      }
    ];

    for (const adminData of adminUsers) {
      const existingAdmin = await this.adminUserRepository.findOne({
        where: { email: adminData.email },
      });

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminData.password, APP_CONSTANTS.BCRYPT_ROUNDS);
        
        const adminUser = this.adminUserRepository.create({
          email: adminData.email,
          username: adminData.username,
          password: hashedPassword,
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          adminRole: adminData.adminRole,
          permissions: adminData.permissions,
          isActive: true,
        });

        await this.adminUserRepository.save(adminUser);
        console.log(`✅ ${adminData.adminRole} user created: ${adminData.email}`);
      } else {
        console.log(`✅ ${adminData.adminRole} user already exists: ${adminData.email}`);
      }
    }
  }

  private async seedRolePermissions(): Promise<void> {
    console.log('🔐 Seeding role permissions...');
    
    const existingPermissions = await this.rolePermissionRepository.count();
    if (existingPermissions > 0) {
      console.log('✅ Role permissions already exist');
      return;
    }

    const rolePermissions = [
      // SUPER_ADMIN 권한
      { role: UserRole.SUPER_ADMIN, resource: Resource.DASHBOARD, permissions: [Permission.MANAGE] },
      { role: UserRole.SUPER_ADMIN, resource: Resource.SETTINGS, permissions: [Permission.MANAGE] },

      // ADMIN 권한
      { role: UserRole.ADMIN, resource: Resource.DASHBOARD, permissions: [Permission.READ] },
      { role: UserRole.ADMIN, resource: Resource.SETTINGS, permissions: [Permission.READ] },
    ];

    for (const permission of rolePermissions) {
      const rolePermission = this.rolePermissionRepository.create(permission);
      await this.rolePermissionRepository.save(rolePermission);
    }

    console.log(`✅ Created ${rolePermissions.length} role permissions`);
  }
}
