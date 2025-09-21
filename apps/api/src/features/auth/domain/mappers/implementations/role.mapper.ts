import { Role as RoleEntity } from '../../entities/role.entity';
import { Role as RoleType } from '@crypto-exchange/shared';
import { RoleResponseDto } from '../../../application/dto/permission.dto';
import { AdminUserRole } from '@crypto-exchange/shared';
import { 
  IRoleMapper, 
  RoleListResponse, 
  UserRoleInfo 
} from '../interfaces/role.mapper.interface';

/**
 * 역할 관련 매핑 구현체
 */
export class RoleMapper implements IRoleMapper {
  /**
   * Role 엔티티를 RoleResponseDto로 변환
   */
  toRoleResponseDto(role: RoleEntity): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      permissions: role.permissions?.map(permission => ({
        id: permission.id,
        role: permission.role?.name || 'unknown',
        resource: permission.resource,
        permissions: permission.permissions,
        createdAt: permission.createdAt.toISOString(),
        updatedAt: permission.updatedAt.toISOString(),
      })) || [],
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    };
  }

  /**
   * RoleType을 RoleResponseDto로 변환 (shared 타입용)
   */
  toRoleResponseDtoFromType(role: RoleType): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      permissions: role.permissions || [],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  /**
   * Role 엔티티 배열을 RoleResponseDto 배열로 변환
   */
  toRoleResponseDtoList(roles: RoleEntity[]): RoleResponseDto[] {
    return roles.map(role => this.toRoleResponseDto(role));
  }

  /**
   * RoleType 배열을 RoleResponseDto 배열로 변환
   */
  toRoleResponseDtoListFromType(roles: RoleType[]): RoleResponseDto[] {
    return roles.map(role => this.toRoleResponseDtoFromType(role));
  }

  /**
   * Role 엔티티를 RoleListResponseDto로 변환
   */
  toRoleListResponseDto(roles: RoleEntity[], total: number): RoleListResponse {
    return {
      roles: this.toRoleResponseDtoList(roles),
      total,
    };
  }

  /**
   * RoleType을 RoleListResponseDto로 변환
   */
  toRoleListResponseDtoFromType(roles: RoleType[], total: number): RoleListResponse {
    return {
      roles: this.toRoleResponseDtoListFromType(roles),
      total,
    };
  }

  /**
   * AdminUserRole을 역할 이름으로 변환
   */
  mapAdminRoleToRoleName(adminRole: string): string {
    const roleMapping: Record<string, string> = {
      [AdminUserRole.SUPER_ADMIN]: 'super_admin',
      [AdminUserRole.ADMIN]: 'admin',
      [AdminUserRole.MODERATOR]: 'moderator',
      [AdminUserRole.SUPPORT]: 'support',
      [AdminUserRole.AUDITOR]: 'auditor',
    };

    return roleMapping[adminRole] || 'support'; // 기본값
  }

  /**
   * 역할 이름을 AdminUserRole로 변환
   */
  mapRoleNameToAdminRole(roleName: string): string {
    const reverseMapping: Record<string, string> = {
      'super_admin': AdminUserRole.SUPER_ADMIN,
      'admin': AdminUserRole.ADMIN,
      'moderator': AdminUserRole.MODERATOR,
      'support': AdminUserRole.SUPPORT,
      'auditor': AdminUserRole.AUDITOR,
    };

    return reverseMapping[roleName] || AdminUserRole.SUPPORT; // 기본값
  }

  /**
   * AdminUserRole이 유효한지 검증
   */
  isValidAdminRole(role: string): boolean {
    return Object.values(AdminUserRole).includes(role as AdminUserRole);
  }

  /**
   * 역할 이름이 유효한지 검증
   */
  isValidRoleName(roleName: string): boolean {
    const validRoleNames = ['super_admin', 'admin', 'moderator', 'support', 'auditor'];
    return validRoleNames.includes(roleName);
  }

  /**
   * 사용자 역할 정보 생성
   */
  createUserRoleInfo(adminRole: string): UserRoleInfo {
    return {
      roleName: this.mapAdminRoleToRoleName(adminRole),
      adminRole,
    };
  }
}
