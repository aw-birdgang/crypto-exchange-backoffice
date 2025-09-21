#!/usr/bin/env ts-node

/**
 * 데이터베이스 초기화 스크립트
 * 실행: npm run init:db
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../features/auth/domain/entities/role.entity';
import { AdminUser } from '../features/auth/domain/entities/admin-user.entity';
import { RolePermission } from '../features/auth/domain/entities/role-permission.entity';
import { AdminUserRole, Resource, Permission } from '@crypto-exchange/shared';
import * as bcrypt from 'bcrypt';

async function initDatabase() {
  let app;
  
  try {
    console.log('🚀 Starting database initialization...');
    
    // NestJS 애플리케이션 생성
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['log', 'error', 'warn'],
    });
    
    const roleRepository = app.get<Repository<Role>>(getRepositoryToken(Role));
    const adminUserRepository = app.get<Repository<AdminUser>>(getRepositoryToken(AdminUser));
    const rolePermissionRepository = app.get<Repository<RolePermission>>(getRepositoryToken(RolePermission));
    
    // 기존 데이터 확인
    const existingRoles = await roleRepository.count();
    const existingUsers = await adminUserRepository.count();
    
    if (existingRoles > 0 || existingUsers > 0) {
      console.log('⚠️ Database already has data, skipping initialization...');
      console.log(`   - Roles: ${existingRoles}`);
      console.log(`   - Users: ${existingUsers}`);
      return;
    }

    console.log('🌱 Initializing database...');

    // 1. 역할 생성
    console.log('🎭 Creating roles...');
    const roles = [
      {
        id: 'role-super-admin',
        name: 'SUPER_ADMIN',
        description: '최고 관리자 - 모든 권한',
        isSystem: true,
      },
      {
        id: 'role-admin',
        name: 'ADMIN',
        description: '일반 관리자 - 대부분의 관리 권한',
        isSystem: true,
      },
      {
        id: 'role-moderator',
        name: 'MODERATOR',
        description: '모더레이터 - 콘텐츠 관리 권한',
        isSystem: true,
      },
      {
        id: 'role-support',
        name: 'SUPPORT',
        description: '고객 지원 - 제한된 관리 권한',
        isSystem: true,
      },
      {
        id: 'role-auditor',
        name: 'AUDITOR',
        description: '감사자 - 읽기 전용 권한',
        isSystem: true,
      },
    ];

    for (const roleData of roles) {
      const role = roleRepository.create(roleData);
      await roleRepository.save(role);
      console.log(`✅ Role created: ${roleData.name}`);
    }

    // 2. 관리자 사용자 생성
    console.log('👑 Creating admin users...');
    const adminUsers = [
      // 기본 시스템 관리자들
      {
        id: 'admin-super-admin',
        email: 'superadmin@crypto-exchange.com',
        username: 'superadmin',
        firstName: 'Super',
        lastName: 'Admin',
        adminRole: AdminUserRole.SUPER_ADMIN,
        permissions: [
          'users:read', 'users:create', 'users:update', 'users:delete',
          'system:configure', 'notifications:read', 'notifications:create',
          'notifications:delete', 'logs:read', 'system:restart',
          'cache:manage', 'database:manage', 'roles:manage',
          'permissions:assign', 'users:change_role', 'audit:read',
          'system:backup', 'system:restore', 'security:manage'
        ],
        password: 'superadmin123!',
        isActive: true,
        status: 'APPROVED'
      },
      {
        id: 'admin-admin',
        email: 'admin@crypto-exchange.com',
        username: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        adminRole: AdminUserRole.ADMIN,
        permissions: [
          'users:read', 'users:create', 'users:update', 'users:suspend',
          'users:ban', 'users:change_role', 'system:configure',
          'notifications:read', 'notifications:create', 'notifications:delete',
          'logs:read', 'cache:manage', 'audit:read'
        ],
        password: 'admin123!',
        isActive: true,
        status: 'APPROVED'
      },
      {
        id: 'admin-moderator',
        email: 'moderator@crypto-exchange.com',
        username: 'moderator',
        firstName: 'Content',
        lastName: 'Moderator',
        adminRole: AdminUserRole.MODERATOR,
        permissions: [
          'users:read', 'users:suspend', 'users:ban',
          'notifications:read', 'notifications:create',
          'logs:read', 'content:moderate', 'reports:read'
        ],
        password: 'moderator123!',
        isActive: true,
        status: 'APPROVED'
      },
      {
        id: 'admin-support',
        email: 'support@crypto-exchange.com',
        username: 'support',
        firstName: 'Customer',
        lastName: 'Support',
        adminRole: AdminUserRole.SUPPORT,
        permissions: [
          'users:read', 'notifications:read', 'notifications:create',
          'logs:read', 'tickets:read', 'tickets:create', 'tickets:update'
        ],
        password: 'support123!',
        isActive: true,
        status: 'APPROVED'
      },
      {
        id: 'admin-auditor',
        email: 'auditor@crypto-exchange.com',
        username: 'auditor',
        firstName: 'System',
        lastName: 'Auditor',
        adminRole: AdminUserRole.AUDITOR,
        permissions: [
          'users:read', 'logs:read', 'audit:read', 'reports:read'
        ],
        password: 'auditor123!',
        isActive: true,
        status: 'APPROVED'
      },
      
      // 추가 관리자들 - 다양한 상태와 역할
      {
        id: 'admin-kim-james',
        email: 'james.kim@crypto-exchange.com',
        username: 'james.kim',
        firstName: 'James',
        lastName: 'Kim',
        adminRole: AdminUserRole.ADMIN,
        permissions: ['users:read', 'users:create', 'users:update', 'system:configure'],
        password: 'james123!',
        isActive: true,
        status: 'APPROVED'
      },
      {
        id: 'admin-lee-sarah',
        email: 'sarah.lee@crypto-exchange.com',
        username: 'sarah.lee',
        firstName: 'Sarah',
        lastName: 'Lee',
        adminRole: AdminUserRole.MODERATOR,
        permissions: ['users:read', 'users:suspend', 'content:moderate'],
        password: 'sarah123!',
        isActive: true,
        status: 'APPROVED'
      },
      {
        id: 'admin-park-mike',
        email: 'mike.park@crypto-exchange.com',
        username: 'mike.park',
        firstName: 'Mike',
        lastName: 'Park',
        adminRole: AdminUserRole.SUPPORT,
        permissions: ['users:read', 'tickets:read', 'tickets:create'],
        password: 'mike123!',
        isActive: true,
        status: 'APPROVED'
      },
      {
        id: 'admin-choi-lisa',
        email: 'lisa.choi@crypto-exchange.com',
        username: 'lisa.choi',
        firstName: 'Lisa',
        lastName: 'Choi',
        adminRole: AdminUserRole.AUDITOR,
        permissions: ['users:read', 'logs:read', 'audit:read'],
        password: 'lisa123!',
        isActive: true,
        status: 'APPROVED'
      },
      {
        id: 'admin-jung-tom',
        email: 'tom.jung@crypto-exchange.com',
        username: 'tom.jung',
        firstName: 'Tom',
        lastName: 'Jung',
        adminRole: AdminUserRole.SUPPORT,
        permissions: ['users:read', 'tickets:read'],
        password: 'tom123!',
        isActive: true,
        status: 'APPROVED'
      },
      
      // 승인 대기 중인 사용자들
      {
        id: 'admin-pending-alice',
        email: 'alice.pending@crypto-exchange.com',
        username: 'alice.pending',
        firstName: 'Alice',
        lastName: 'Johnson',
        adminRole: AdminUserRole.SUPPORT,
        permissions: ['users:read'],
        password: 'alice123!',
        isActive: false,
        status: 'PENDING'
      },
      {
        id: 'admin-pending-bob',
        email: 'bob.pending@crypto-exchange.com',
        username: 'bob.pending',
        firstName: 'Bob',
        lastName: 'Smith',
        adminRole: AdminUserRole.MODERATOR,
        permissions: ['users:read'],
        password: 'bob123!',
        isActive: false,
        status: 'PENDING'
      },
      {
        id: 'admin-pending-charlie',
        email: 'charlie.pending@crypto-exchange.com',
        username: 'charlie.pending',
        firstName: 'Charlie',
        lastName: 'Brown',
        adminRole: AdminUserRole.ADMIN,
        permissions: ['users:read'],
        password: 'charlie123!',
        isActive: false,
        status: 'PENDING'
      },
      {
        id: 'admin-pending-diana',
        email: 'diana.pending@crypto-exchange.com',
        username: 'diana.pending',
        firstName: 'Diana',
        lastName: 'Wilson',
        adminRole: AdminUserRole.SUPPORT,
        permissions: ['users:read'],
        password: 'diana123!',
        isActive: false,
        status: 'PENDING'
      },
      {
        id: 'admin-pending-eve',
        email: 'eve.pending@crypto-exchange.com',
        username: 'eve.pending',
        firstName: 'Eve',
        lastName: 'Davis',
        adminRole: AdminUserRole.AUDITOR,
        permissions: ['users:read'],
        password: 'eve123!',
        isActive: false,
        status: 'PENDING'
      },
      
      // 거부된 사용자들
      {
        id: 'admin-rejected-frank',
        email: 'frank.rejected@crypto-exchange.com',
        username: 'frank.rejected',
        firstName: 'Frank',
        lastName: 'Miller',
        adminRole: AdminUserRole.SUPPORT,
        permissions: [],
        password: 'frank123!',
        isActive: false,
        status: 'REJECTED'
      },
      {
        id: 'admin-rejected-grace',
        email: 'grace.rejected@crypto-exchange.com',
        username: 'grace.rejected',
        firstName: 'Grace',
        lastName: 'Taylor',
        adminRole: AdminUserRole.MODERATOR,
        permissions: [],
        password: 'grace123!',
        isActive: false,
        status: 'REJECTED'
      },
      
      // 정지된 사용자들
      {
        id: 'admin-suspended-henry',
        email: 'henry.suspended@crypto-exchange.com',
        username: 'henry.suspended',
        firstName: 'Henry',
        lastName: 'Anderson',
        adminRole: AdminUserRole.ADMIN,
        permissions: ['users:read'],
        password: 'henry123!',
        isActive: false,
        status: 'SUSPENDED'
      },
      {
        id: 'admin-suspended-ivy',
        email: 'ivy.suspended@crypto-exchange.com',
        username: 'ivy.suspended',
        firstName: 'Ivy',
        lastName: 'Thomas',
        adminRole: AdminUserRole.SUPPORT,
        permissions: ['users:read'],
        password: 'ivy123!',
        isActive: false,
        status: 'SUSPENDED'
      },
      
      // 비활성화된 사용자들
      {
        id: 'admin-inactive-jack',
        email: 'jack.inactive@crypto-exchange.com',
        username: 'jack.inactive',
        firstName: 'Jack',
        lastName: 'Jackson',
        adminRole: AdminUserRole.SUPPORT,
        permissions: ['users:read'],
        password: 'jack123!',
        isActive: false,
        status: 'APPROVED'
      },
      {
        id: 'admin-inactive-kate',
        email: 'kate.inactive@crypto-exchange.com',
        username: 'kate.inactive',
        firstName: 'Kate',
        lastName: 'White',
        adminRole: AdminUserRole.MODERATOR,
        permissions: ['users:read'],
        password: 'kate123!',
        isActive: false,
        status: 'APPROVED'
      },
      
      // 추가 활성 사용자들
      {
        id: 'admin-luke',
        email: 'luke.martin@crypto-exchange.com',
        username: 'luke.martin',
        firstName: 'Luke',
        lastName: 'Martin',
        adminRole: AdminUserRole.SUPPORT,
        permissions: ['users:read', 'tickets:read', 'tickets:create'],
        password: 'luke123!',
        isActive: true,
        status: 'APPROVED'
      },
      {
        id: 'admin-mary',
        email: 'mary.garcia@crypto-exchange.com',
        username: 'mary.garcia',
        firstName: 'Mary',
        lastName: 'Garcia',
        adminRole: AdminUserRole.AUDITOR,
        permissions: ['users:read', 'logs:read', 'audit:read'],
        password: 'mary123!',
        isActive: true,
        status: 'APPROVED'
      },
      {
        id: 'admin-nick',
        email: 'nick.rodriguez@crypto-exchange.com',
        username: 'nick.rodriguez',
        firstName: 'Nick',
        lastName: 'Rodriguez',
        adminRole: AdminUserRole.MODERATOR,
        permissions: ['users:read', 'users:suspend', 'content:moderate'],
        password: 'nick123!',
        isActive: true,
        status: 'APPROVED'
      },
      {
        id: 'admin-olivia',
        email: 'olivia.martinez@crypto-exchange.com',
        username: 'olivia.martinez',
        firstName: 'Olivia',
        lastName: 'Martinez',
        adminRole: AdminUserRole.ADMIN,
        permissions: ['users:read', 'users:create', 'users:update', 'system:configure'],
        password: 'olivia123!',
        isActive: true,
        status: 'APPROVED'
      }
    ];

    for (const adminData of adminUsers) {
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      const adminUser = adminUserRepository.create({
        email: adminData.email,
        username: adminData.username,
        password: hashedPassword,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        adminRole: adminData.adminRole,
        permissions: adminData.permissions,
        isActive: adminData.isActive,
        status: adminData.status,
        approvedBy: adminData.status === 'APPROVED' ? 'system' : null,
        approvedAt: adminData.status === 'APPROVED' ? new Date() : null,
        createdBy: 'system',
        updatedBy: 'system',
      } as any);

      await adminUserRepository.save(adminUser);
      console.log(`✅ ${adminData.adminRole} user created: ${adminData.email} (${adminData.status}, Active: ${adminData.isActive})`);
    }

    // 3. 역할 권한 생성
    console.log('🔐 Creating role permissions...');
    const superAdminRole = await roleRepository.findOne({ where: { name: 'SUPER_ADMIN' } });
    const adminRole = await roleRepository.findOne({ where: { name: 'ADMIN' } });
    const moderatorRole = await roleRepository.findOne({ where: { name: 'MODERATOR' } });
    const supportRole = await roleRepository.findOne({ where: { name: 'SUPPORT' } });
    const auditorRole = await roleRepository.findOne({ where: { name: 'AUDITOR' } });

    const rolePermissions = [
      // SUPER_ADMIN 권한
      { role: superAdminRole, resource: Resource.DASHBOARD, permissions: [Permission.MANAGE] },
      { role: superAdminRole, resource: Resource.SETTINGS, permissions: [Permission.MANAGE] },
      { role: superAdminRole, resource: Resource.PERMISSIONS, permissions: [Permission.MANAGE] },
      { role: superAdminRole, resource: Resource.USERS, permissions: [Permission.MANAGE] },
      { role: superAdminRole, resource: Resource.ROLES, permissions: [Permission.MANAGE] },
      
      // ADMIN 권한
      { role: adminRole, resource: Resource.DASHBOARD, permissions: [Permission.READ] },
      { role: adminRole, resource: Resource.SETTINGS, permissions: [Permission.READ, Permission.UPDATE] },
      { role: adminRole, resource: Resource.PERMISSIONS, permissions: [Permission.READ] },
      { role: adminRole, resource: Resource.USERS, permissions: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE] },
      { role: adminRole, resource: Resource.ROLES, permissions: [Permission.READ] },
      
      // MODERATOR 권한
      { role: moderatorRole, resource: Resource.DASHBOARD, permissions: [Permission.READ] },
      { role: moderatorRole, resource: Resource.USERS, permissions: [Permission.READ, Permission.UPDATE] },
      
      // SUPPORT 권한
      { role: supportRole, resource: Resource.DASHBOARD, permissions: [Permission.READ] },
      { role: supportRole, resource: Resource.USERS, permissions: [Permission.READ] },
      
      // AUDITOR 권한
      { role: auditorRole, resource: Resource.DASHBOARD, permissions: [Permission.READ] },
      { role: auditorRole, resource: Resource.USERS, permissions: [Permission.READ] },
    ];

    for (const permission of rolePermissions) {
      if (permission.role) {
        const rolePermission = rolePermissionRepository.create({
          role: permission.role,
          resource: permission.resource,
          permissions: permission.permissions,
        });
        await rolePermissionRepository.save(rolePermission);
      }
    }

    console.log('✅ Database initialization completed successfully!');
    console.log('');
    console.log('📋 Available login accounts:');
    console.log('  SUPER_ADMIN: superadmin@crypto-exchange.com / superadmin123!');
    console.log('  ADMIN:       admin@crypto-exchange.com / admin123!');
    console.log('  MODERATOR:   moderator@crypto-exchange.com / moderator123!');
    console.log('  SUPPORT:     support@crypto-exchange.com / support123!');
    console.log('  AUDITOR:     auditor@crypto-exchange.com / auditor123!');
    console.log('');
    console.log('📊 User Statistics:');
    console.log(`  Total Users: ${adminUsers.length}`);
    console.log(`  Active Users: ${adminUsers.filter(u => u.isActive).length}`);
    console.log(`  Approved Users: ${adminUsers.filter(u => u.status === 'APPROVED').length}`);
    console.log(`  Pending Users: ${adminUsers.filter(u => u.status === 'PENDING').length}`);
    console.log(`  Rejected Users: ${adminUsers.filter(u => u.status === 'REJECTED').length}`);
    console.log(`  Suspended Users: ${adminUsers.filter(u => u.status === 'SUSPENDED').length}`);
    console.log('');
    console.log('🎭 Role Distribution:');
    const roleCounts = adminUsers.reduce((acc, user) => {
      acc[user.adminRole] = (acc[user.adminRole] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} users`);
    });
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    if (app) {
      await app.close();
    }
  }
}

initDatabase();
