import { AdminUser } from '../../entities/admin-user.entity';
import { AdminUserResponseDto } from '../../../application/dto/permission.dto';

/**
 * 사용자 관련 매핑 인터페이스
 */
export interface IUserMapper {
  /**
   * AdminUser를 AdminUserResponseDto로 변환
   */
  toUserResponseDto(adminUser: AdminUser): AdminUserResponseDto;

  /**
   * AdminUser 배열을 AdminUserResponseDto 배열로 변환
   */
  toUserResponseDtoList(adminUsers: AdminUser[]): AdminUserResponseDto[];

  /**
   * 상세 사용자 정보로 변환 (권한 정보 포함)
   */
  toDetailedUserDto(adminUser: AdminUser, context?: UserContext): DetailedUserDto;
}

/**
 * 사용자 컨텍스트 정보
 */
export interface UserContext {
  permissions?: any[];
  lastLoginIp?: string;
  sessionInfo?: {
    sessionId: string;
    ipAddress: string;
    userAgent: string;
  };
}

/**
 * 상세 사용자 DTO
 */
export interface DetailedUserDto extends AdminUserResponseDto {
  permissions?: PermissionDto[];
  roleHierarchy?: number;
  accessLevel?: 'SYSTEM' | 'ADMIN' | 'USER';
  riskScore?: number;
  lastLoginIp?: string;
}

/**
 * 권한 DTO
 */
export interface PermissionDto {
  resource: string;
  actions: string[];
  grantedAt: string;
}
