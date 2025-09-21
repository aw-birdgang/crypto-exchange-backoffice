import { RolePermission } from '../../entities/role-permission.entity';
import { PermissionCheckResponseDto, MenuAccessResponseDto, RoleResponseDto } from '../../../application/dto/permission.dto';
import { UserPermissions } from '@crypto-exchange/shared';

/**
 * 권한 관련 매핑 인터페이스
 */
export interface IPermissionMapper {
  /**
   * 권한 확인 응답 생성
   */
  toPermissionCheckResponse(hasPermission: boolean): PermissionCheckResponseDto;

  /**
   * 메뉴 접근 응답 생성
   */
  toMenuAccessResponse(hasAccess: boolean): MenuAccessResponseDto;

  /**
   * 사용자 권한 정보 생성
   */
  toUserPermissions(userPermissions: UserPermissions): UserPermissions;

  /**
   * RolePermission을 권한 정보로 변환
   */
  toPermissionInfo(rolePermission: RolePermission): PermissionInfo;

  /**
   * RolePermission 배열을 권한 정보 배열로 변환
   */
  toPermissionInfoList(rolePermissions: RolePermission[]): PermissionInfo[];

  /**
   * 역할별 기본 권한 설정
   */
  getDefaultPermissions(role: string): string[];

  /**
   * 역할별 권한 레벨 확인
   */
  getRoleLevel(role: string): number;

  /**
   * 역할 권한 레벨 비교
   */
  hasHigherOrEqualLevel(role1: string, role2: string): boolean;

  /**
   * 역할이 시스템 관리자 권한을 가지는지 확인
   */
  isSystemAdmin(role: string): boolean;

  /**
   * 역할이 사용자 관리 권한을 가지는지 확인
   */
  canManageUsers(role: string): boolean;
}

/**
 * 권한 정보
 */
export interface PermissionInfo {
  id: string;
  role: string;
  resource: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}
