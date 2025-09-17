import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { RolePermission } from '../../domain/entities/role-permission.entity';
import { UserRole, Resource, Permission } from '@crypto-exchange/shared';
import * as bcrypt from 'bcrypt';
import { APP_CONSTANTS } from '@crypto-exchange/shared';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async seedDatabase(): Promise<void> {
    console.log('🌱 Starting database seeding...');
    
    await this.seedUsers();
    await this.seedRolePermissions();
    
    console.log('✅ Database seeding completed!');
  }

  private async seedUsers(): Promise<void> {
    console.log('👤 Seeding users...');
    
    const adminUser = await this.userRepository.findOne({
      where: { email: 'admin@crypto-exchange.com' },
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123!', APP_CONSTANTS.BCRYPT_ROUNDS);
      
      const user = this.userRepository.create({
        email: 'admin@crypto-exchange.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      });

      await this.userRepository.save(user);
      console.log('✅ Admin user created');
    } else {
      // 기존 사용자가 있으면 role을 super_admin으로 업데이트
      if (adminUser.role !== UserRole.SUPER_ADMIN) {
        adminUser.role = UserRole.SUPER_ADMIN;
        await this.userRepository.save(adminUser);
        console.log('✅ Admin user role updated to SUPER_ADMIN');
      } else {
        console.log('✅ Admin user already exists with correct role');
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
      { role: UserRole.SUPER_ADMIN, resource: Resource.USERS, permissions: [Permission.MANAGE] },
      { role: UserRole.SUPER_ADMIN, resource: Resource.ORDERS, permissions: [Permission.MANAGE] },
      { role: UserRole.SUPER_ADMIN, resource: Resource.MARKETS, permissions: [Permission.MANAGE] },
      { role: UserRole.SUPER_ADMIN, resource: Resource.WALLETS, permissions: [Permission.MANAGE] },
      { role: UserRole.SUPER_ADMIN, resource: Resource.SETTINGS, permissions: [Permission.MANAGE] },
      { role: UserRole.SUPER_ADMIN, resource: Resource.REPORTS, permissions: [Permission.MANAGE] },
      { role: UserRole.SUPER_ADMIN, resource: Resource.AUDIT_LOGS, permissions: [Permission.MANAGE] },

      // ADMIN 권한
      { role: UserRole.ADMIN, resource: Resource.DASHBOARD, permissions: [Permission.READ] },
      { role: UserRole.ADMIN, resource: Resource.USERS, permissions: [Permission.READ, Permission.UPDATE] },
      { role: UserRole.ADMIN, resource: Resource.ORDERS, permissions: [Permission.READ, Permission.UPDATE] },
      { role: UserRole.ADMIN, resource: Resource.MARKETS, permissions: [Permission.READ, Permission.UPDATE] },
      { role: UserRole.ADMIN, resource: Resource.WALLETS, permissions: [Permission.READ, Permission.UPDATE] },
      { role: UserRole.ADMIN, resource: Resource.REPORTS, permissions: [Permission.READ] },

      // USER_MANAGER 권한
      { role: UserRole.USER_MANAGER, resource: Resource.DASHBOARD, permissions: [Permission.READ] },
      { role: UserRole.USER_MANAGER, resource: Resource.USERS, permissions: [Permission.MANAGE] },
      { role: UserRole.USER_MANAGER, resource: Resource.REPORTS, permissions: [Permission.READ] },

      // ORDER_MANAGER 권한
      { role: UserRole.ORDER_MANAGER, resource: Resource.DASHBOARD, permissions: [Permission.READ] },
      { role: UserRole.ORDER_MANAGER, resource: Resource.ORDERS, permissions: [Permission.MANAGE] },
      { role: UserRole.ORDER_MANAGER, resource: Resource.REPORTS, permissions: [Permission.READ] },

      // MARKET_MANAGER 권한
      { role: UserRole.MARKET_MANAGER, resource: Resource.DASHBOARD, permissions: [Permission.READ] },
      { role: UserRole.MARKET_MANAGER, resource: Resource.MARKETS, permissions: [Permission.MANAGE] },
      { role: UserRole.MARKET_MANAGER, resource: Resource.REPORTS, permissions: [Permission.READ] },

      // WALLET_MANAGER 권한
      { role: UserRole.WALLET_MANAGER, resource: Resource.DASHBOARD, permissions: [Permission.READ] },
      { role: UserRole.WALLET_MANAGER, resource: Resource.WALLETS, permissions: [Permission.MANAGE] },
      { role: UserRole.WALLET_MANAGER, resource: Resource.REPORTS, permissions: [Permission.READ] },
    ];

    for (const permission of rolePermissions) {
      const rolePermission = this.rolePermissionRepository.create(permission);
      await this.rolePermissionRepository.save(rolePermission);
    }

    console.log(`✅ Created ${rolePermissions.length} role permissions`);
  }
}
