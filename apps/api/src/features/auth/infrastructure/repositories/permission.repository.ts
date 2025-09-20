import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUserRole, Resource, Permission, UserPermissions, ROLE_PERMISSIONS, MENU_PERMISSIONS } from '@crypto-exchange/shared';
import { RolePermission } from '../../domain/entities/role-permission.entity';
import { PermissionRepositoryInterface } from '../../domain/repositories/permission.repository.interface';
import { AdminUser } from '../../domain/entities/admin-user.entity';
import { Role } from '../../domain/entities/role.entity';

@Injectable()
export class PermissionRepository implements PermissionRepositoryInterface {
  constructor(
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async getUserPermissions(userId: string): Promise<UserPermissions> {
    try {
      console.log('🚀 PermissionRepository: getUserPermissions called with userId:', userId);
      
      // 1. 사용자 정보 조회 (인덱스 최적화)
      const user = await this.adminUserRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.email', 'user.adminRole', 'user.isActive'])
        .where('user.id = :userId', { userId })
        .andWhere('user.isActive = :isActive', { isActive: true })
        .getOne();

      if (!user) {
        console.error('❌ PermissionRepository: User not found or inactive for userId:', userId);
        throw new Error(`User not found or inactive: ${userId}`);
      }

      console.log('✅ PermissionRepository: User found:', {
        id: user.id,
        email: user.email,
        adminRole: user.adminRole
      });

      // 2. AdminUserRole 직접 사용
      const userRole = user.adminRole;
      console.log('🔍 PermissionRepository: Mapped userRole:', userRole);
      
      // 3. SUPER_ADMIN은 모든 권한을 가짐
      if (user.adminRole === AdminUserRole.SUPER_ADMIN) {
        console.log('✅ PermissionRepository: SUPER_ADMIN - returning all permissions');
        
        // 모든 리소스에 대해 MANAGE 권한 부여
        const allResources = Object.values(Resource);
        const allPermissions = allResources.map(resource => ({
          resource,
          permissions: [Permission.MANAGE]
        }));

        console.log('✅ PermissionRepository: SUPER_ADMIN permissions:', {
          userId,
          role: userRole,
          permissionsCount: allPermissions.length,
          resources: allPermissions.map(p => p.resource)
        });

        return {
          userId,
          role: userRole,
          permissions: allPermissions,
        };
      }
      
      // 4. Role 정보 조회 (인덱스 최적화)
      const role = await this.roleRepository
        .createQueryBuilder('role')
        .select(['role.id', 'role.name', 'role.description', 'role.isSystem'])
        .where('role.name = :roleName', { roleName: userRole })
        .getOne();

      if (!role) {
        console.log('❌ PermissionRepository: Role not found for userRole:', userRole);
        console.log('🔍 PermissionRepository: Available roles in database:');
        const allRoles = await this.roleRepository
          .createQueryBuilder('r')
          .select(['r.id', 'r.name'])
          .getMany();
        allRoles.forEach(r => console.log('  - Role:', r.name, 'ID:', r.id));
        
        return {
          userId: user.id,
          role: userRole,
          permissions: []
        };
      }
      
      console.log('✅ PermissionRepository: Found role:', { id: role.id, name: role.name });

      // 5. RolePermissions 조회 (최적화된 쿼리)
      const rolePermissions = await this.rolePermissionRepository
        .createQueryBuilder('rp')
        .select([
          'rp.id',
          'rp.resource', 
          'rp.permissions',
          'rp.createdAt',
          'rp.updatedAt'
        ])
        .where('rp.roleId = :roleId', { roleId: role.id })
        .orderBy('rp.resource', 'ASC') // 정렬로 일관성 보장
        .getRawMany();

      console.log('🔍 PermissionRepository: Found rolePermissions:', rolePermissions.length);

      // 6. 권한 데이터 변환 및 검증
      const permissions = rolePermissions.map(rp => {
        // JSON 파싱 검증
        let parsedPermissions = rp.permissions;
        if (typeof rp.permissions === 'string') {
          try {
            parsedPermissions = JSON.parse(rp.permissions);
          } catch (error) {
            console.error('❌ PermissionRepository: Failed to parse permissions JSON:', rp.permissions);
            parsedPermissions = [];
          }
        }

        return {
          resource: rp.resource,
          permissions: Array.isArray(parsedPermissions) ? parsedPermissions : [],
        };
      });

      console.log('✅ PermissionRepository: Returning permissions:', {
        userId,
        role: userRole,
        permissionsCount: permissions.length,
        resources: permissions.map(p => p.resource)
      });

      return {
        userId,
        role: userRole,
        permissions,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ PermissionRepository: Error in getUserPermissions:', error);
      throw new Error(`Failed to get user permissions: ${errorMessage}`);
    }
  }

  async hasPermission(userId: string, resource: Resource, permission: Permission): Promise<boolean> {
    try {
      // 1. 사용자 정보 조회 (최적화된 쿼리)
      const user = await this.adminUserRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.adminRole', 'user.isActive'])
        .where('user.id = :userId', { userId })
        .andWhere('user.isActive = :isActive', { isActive: true })
        .getOne();

      if (!user) {
        console.log('❌ PermissionRepository: User not found or inactive for hasPermission check:', userId);
        return false;
      }

      // 2. SUPER_ADMIN은 모든 권한을 가짐
      if (user.adminRole === 'SUPER_ADMIN') {
        console.log('✅ PermissionRepository: SUPER_ADMIN has all permissions');
        return true;
      }

      // 3. AdminUserRole 직접 사용
      const userRole = user.adminRole;
      
      // 4. Role ID 조회 (최적화된 쿼리)
      const role = await this.roleRepository
        .createQueryBuilder('role')
        .select(['role.id'])
        .where('role.name = :roleName', { roleName: userRole })
        .getOne();

      if (!role) {
        console.log('❌ PermissionRepository: Role not found for hasPermission check:', userRole);
        return false;
      }
      
      // 5. 권한 확인 (최적화된 쿼리)
      const rolePermission = await this.rolePermissionRepository
        .createQueryBuilder('rp')
        .select(['rp.permissions'])
        .where('rp.roleId = :roleId', { roleId: role.id })
        .andWhere('rp.resource = :resource', { resource })
        .getOne();

      if (!rolePermission) {
        console.log('❌ PermissionRepository: No permission found for resource:', resource);
        return false;
      }

      // 6. 권한 배열 파싱 및 검증
      let permissions = rolePermission.permissions;
      if (typeof permissions === 'string') {
        try {
          permissions = JSON.parse(permissions);
        } catch (error) {
          console.error('❌ PermissionRepository: Failed to parse permissions JSON in hasPermission:', permissions);
          return false;
        }
      }

      const hasPermission = Array.isArray(permissions) && 
        (permissions.includes(permission) || permissions.includes(Permission.MANAGE));

      console.log('🔍 PermissionRepository: Permission check result:', {
        userId,
        resource,
        permission,
        hasPermission,
        userRole
      });

      return hasPermission;
    } catch (error) {
      console.error('❌ PermissionRepository: Error in hasPermission:', error);
      return false;
    }
  }

  async hasAnyPermission(userId: string, resource: Resource, permissions: Permission[]): Promise<boolean> {
    try {
      // 빈 배열 체크
      if (!permissions || permissions.length === 0) {
        return false;
      }

      // 1. 사용자 정보 조회 (최적화된 쿼리)
      const user = await this.adminUserRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.adminRole', 'user.isActive'])
        .where('user.id = :userId', { userId })
        .andWhere('user.isActive = :isActive', { isActive: true })
        .getOne();

      if (!user) {
        console.log('❌ PermissionRepository: User not found or inactive for hasAnyPermission check:', userId);
        return false;
      }

      // 2. SUPER_ADMIN은 모든 권한을 가짐
      if (user.adminRole === 'SUPER_ADMIN') {
        console.log('✅ PermissionRepository: SUPER_ADMIN has all permissions');
        return true;
      }

      // 3. AdminUserRole 직접 사용
      const userRole = user.adminRole;
      
      // 4. Role ID 조회 (최적화된 쿼리)
      const role = await this.roleRepository
        .createQueryBuilder('role')
        .select(['role.id'])
        .where('role.name = :roleName', { roleName: userRole })
        .getOne();

      if (!role) {
        console.log('❌ PermissionRepository: Role not found for hasAnyPermission check:', userRole);
        return false;
      }
      
      // 5. 권한 확인 (최적화된 쿼리)
      const rolePermission = await this.rolePermissionRepository
        .createQueryBuilder('rp')
        .select(['rp.permissions'])
        .where('rp.roleId = :roleId', { roleId: role.id })
        .andWhere('rp.resource = :resource', { resource })
        .getOne();

      if (!rolePermission) {
        console.log('❌ PermissionRepository: No permission found for resource in hasAnyPermission:', resource);
        return false;
      }

      // 6. 권한 배열 파싱 및 검증
      let rolePermissions = rolePermission.permissions;
      if (typeof rolePermissions === 'string') {
        try {
          rolePermissions = JSON.parse(rolePermissions);
        } catch (error) {
          console.error('❌ PermissionRepository: Failed to parse permissions JSON in hasAnyPermission:', rolePermissions);
          return false;
        }
      }

      if (!Array.isArray(rolePermissions)) {
        return false;
      }

      // 7. 요청된 권한 중 하나라도 있는지 확인
      const hasAnyPermission = permissions.some(permission => 
        rolePermissions.includes(permission) || rolePermissions.includes(Permission.MANAGE)
      );

      console.log('🔍 PermissionRepository: hasAnyPermission check result:', {
        userId,
        resource,
        requestedPermissions: permissions,
        rolePermissions,
        hasAnyPermission
      });

      return hasAnyPermission;
    } catch (error) {
      console.error('❌ PermissionRepository: Error in hasAnyPermission:', error);
      return false;
    }
  }

  async hasMenuAccess(userId: string, menuKey: string): Promise<boolean> {
    try {
      // 1. 사용자 정보 조회 (최적화된 쿼리)
      const user = await this.adminUserRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.adminRole', 'user.isActive'])
        .where('user.id = :userId', { userId })
        .andWhere('user.isActive = :isActive', { isActive: true })
        .getOne();

      if (!user) {
        console.log('❌ PermissionRepository: User not found or inactive for hasMenuAccess check:', userId);
        return false;
      }

      // 2. SUPER_ADMIN은 모든 메뉴에 접근 가능
      if (user.adminRole === 'SUPER_ADMIN') {
        console.log('✅ PermissionRepository: SUPER_ADMIN has access to all menus');
        return true;
      }

      // 3. AdminUserRole 직접 사용
      const userRole = user.adminRole;
      
      // 4. 메뉴 권한 확인
      const allowedRoles = MENU_PERMISSIONS[menuKey as keyof typeof MENU_PERMISSIONS];
      const hasAccess = allowedRoles ? allowedRoles.includes(userRole as any) : false;

      console.log('🔍 PermissionRepository: hasMenuAccess check result:', {
        userId,
        menuKey,
        userRole,
        allowedRoles,
        hasAccess
      });

      return hasAccess;
    } catch (error) {
      console.error('❌ PermissionRepository: Error in hasMenuAccess:', error);
      return false;
    }
  }

  async createRolePermission(rolePermission: Partial<RolePermission>): Promise<RolePermission> {
    const newRolePermission = this.rolePermissionRepository.create(rolePermission);
    return this.rolePermissionRepository.save(newRolePermission);
  }

  async updateRolePermission(id: string, rolePermission: Partial<RolePermission>): Promise<RolePermission> {
    await this.rolePermissionRepository.update(id, rolePermission);
    const updated = await this.rolePermissionRepository.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`RolePermission with id ${id} not found`);
    }
    return updated;
  }

  async deleteRolePermission(id: string): Promise<void> {
    await this.rolePermissionRepository.delete(id);
  }

  async getRolePermissions(role: AdminUserRole): Promise<RolePermission[]> {
    // AdminUserRole을 Role 엔티티로 변환
    const roleEntity = await this.roleRepository.findOne({ where: { name: role } });
    if (!roleEntity) {
      return [];
    }
    
    return this.rolePermissionRepository.find({
      where: { role: roleEntity },
    });
  }

  async getAllRolePermissions(): Promise<RolePermission[]> {
    return this.rolePermissionRepository.find();
  }

  // 초기 권한 데이터 설정
  async initializeDefaultPermissions(): Promise<void> {
    // 기존 권한을 모두 삭제하고 새로 생성
    await this.rolePermissionRepository.clear();
    console.log('🗑️ Cleared existing role permissions');

    const defaultPermissions: Partial<RolePermission>[] = [];

    // ROLE_PERMISSIONS 상수를 기반으로 기본 권한 생성
    for (const [roleKey, roleData] of Object.entries(ROLE_PERMISSIONS)) {
      // AdminUserRole을 Role 엔티티로 변환
      const roleEntity = await this.roleRepository.findOne({ where: { name: (roleData as any).role } });
      if (!roleEntity) {
        console.log(`❌ Role not found: ${(roleData as any).role}`);
        continue;
      }

      Object.entries((roleData as any).permissions).forEach(([resource, permissions]) => {
        defaultPermissions.push({
          role: roleEntity,
          resource: resource as Resource,
          permissions: permissions as Permission[],
        });
      });
    }

    await this.rolePermissionRepository.save(defaultPermissions);
  }

}
