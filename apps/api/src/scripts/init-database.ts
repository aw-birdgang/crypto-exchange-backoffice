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
        password: 'superadmin123!'
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
        password: 'admin123!'
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
        password: 'moderator123!'
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
        password: 'support123!'
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
        password: 'auditor123!'
      }
    ];

    for (const adminData of adminUsers) {
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      const adminUser = adminUserRepository.create({
        id: adminData.id,
        email: adminData.email,
        username: adminData.username,
        password: hashedPassword,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        adminRole: adminData.adminRole,
        permissions: adminData.permissions,
        isActive: true,
        status: 'APPROVED',
        approvedBy: 'system',
        approvedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
      });

      await adminUserRepository.save(adminUser);
      console.log(`✅ ${adminData.adminRole} user created: ${adminData.email}`);
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
