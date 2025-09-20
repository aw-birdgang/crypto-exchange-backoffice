import { Role as RoleEntity } from '../../domain/entities/role.entity';
import { Role as RoleType } from '@crypto-exchange/shared';
import { RoleResponseDto } from '../dto/permission.dto';

/**
 * Role 엔티티를 DTO로 변환하는 유틸리티 함수
 */
export class RoleMapper {
  /**
   * Role 엔티티를 RoleResponseDto로 변환
   */
  static toRoleResponseDto(role: RoleEntity): RoleResponseDto {
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
  static toRoleResponseDtoFromType(role: RoleType): RoleResponseDto {
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
  static toRoleResponseDtoList(roles: RoleEntity[]): RoleResponseDto[] {
    return roles.map(role => this.toRoleResponseDto(role));
  }

  /**
   * RoleType 배열을 RoleResponseDto 배열로 변환
   */
  static toRoleResponseDtoListFromType(roles: RoleType[]): RoleResponseDto[] {
    return roles.map(role => this.toRoleResponseDtoFromType(role));
  }

  /**
   * Role 엔티티를 RoleListResponseDto로 변환
   */
  static toRoleListResponseDto(roles: RoleEntity[], total: number) {
    return {
      roles: this.toRoleResponseDtoList(roles),
      total,
    };
  }

  /**
   * RoleType을 RoleListResponseDto로 변환
   */
  static toRoleListResponseDtoFromType(roles: RoleType[], total: number) {
    return {
      roles: this.toRoleResponseDtoListFromType(roles),
      total,
    };
  }
}
