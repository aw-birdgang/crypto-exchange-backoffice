import { RolePermission } from '../../domain/entities/role-permission.entity';
import { PermissionCheckResponseDto, MenuAccessResponseDto } from '../dto/permission.dto';
import { UserPermissions } from '@crypto-exchange/shared';

/**
 * 권한 관련 매핑 유틸리티 함수
 */
export class PermissionMapper {
  /**
   * 권한 확인 응답 생성
   */
  static toPermissionCheckResponse(hasPermission: boolean): PermissionCheckResponseDto {
    return {
      hasPermission,
    };
  }

  /**
   * 메뉴 접근 응답 생성
   */
  static toMenuAccessResponse(hasAccess: boolean): MenuAccessResponseDto {
    return {
      hasAccess,
    };
  }

  /**
   * 사용자 권한 정보 생성
   */
  static toUserPermissions(userPermissions: UserPermissions): UserPermissions {
    return {
      ...userPermissions,
    };
  }

  /**
   * RolePermission을 권한 정보로 변환
   */
  static toPermissionInfo(rolePermission: RolePermission) {
    return {
      id: rolePermission.id,
      role: rolePermission.role?.name || 'unknown',
      resource: rolePermission.resource,
      permissions: rolePermission.permissions,
      createdAt: rolePermission.createdAt.toISOString(),
      updatedAt: rolePermission.updatedAt.toISOString(),
    };
  }

  /**
   * RolePermission 배열을 권한 정보 배열로 변환
   */
  static toPermissionInfoList(rolePermissions: RolePermission[]) {
    return rolePermissions.map(permission => this.toPermissionInfo(permission));
  }
}
