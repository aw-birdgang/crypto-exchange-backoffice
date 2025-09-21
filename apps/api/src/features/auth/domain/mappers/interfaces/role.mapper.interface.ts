import { Role as RoleEntity } from '../../entities/role.entity';
import { Role as RoleType } from '@crypto-exchange/shared';
import { RoleResponseDto } from '../../../application/dto/permission.dto';

/**
 * 역할 관련 매핑 인터페이스
 */
export interface IRoleMapper {
  /**
   * Role 엔티티를 RoleResponseDto로 변환
   */
  toRoleResponseDto(role: RoleEntity): RoleResponseDto;

  /**
   * RoleType을 RoleResponseDto로 변환 (shared 타입용)
   */
  toRoleResponseDtoFromType(role: RoleType): RoleResponseDto;

  /**
   * Role 엔티티 배열을 RoleResponseDto 배열로 변환
   */
  toRoleResponseDtoList(roles: RoleEntity[]): RoleResponseDto[];

  /**
   * RoleType 배열을 RoleResponseDto 배열로 변환
   */
  toRoleResponseDtoListFromType(roles: RoleType[]): RoleResponseDto[];

  /**
   * Role 엔티티를 RoleListResponseDto로 변환
   */
  toRoleListResponseDto(roles: RoleEntity[], total: number): RoleListResponse;

  /**
   * RoleType을 RoleListResponseDto로 변환
   */
  toRoleListResponseDtoFromType(roles: RoleType[], total: number): RoleListResponse;

  /**
   * AdminUserRole을 역할 이름으로 변환
   */
  mapAdminRoleToRoleName(adminRole: string): string;

  /**
   * 역할 이름을 AdminUserRole로 변환
   */
  mapRoleNameToAdminRole(roleName: string): string;

  /**
   * AdminUserRole이 유효한지 검증
   */
  isValidAdminRole(role: string): boolean;

  /**
   * 역할 이름이 유효한지 검증
   */
  isValidRoleName(roleName: string): boolean;

  /**
   * 사용자 역할 정보 생성
   */
  createUserRoleInfo(adminRole: string): UserRoleInfo;
}

/**
 * 역할 목록 응답
 */
export interface RoleListResponse {
  roles: RoleResponseDto[];
  total: number;
}

/**
 * 사용자 역할 정보
 */
export interface UserRoleInfo {
  roleName: string;
  adminRole: string;
}
