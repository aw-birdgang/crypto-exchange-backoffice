import { AdminUser } from '../../entities/admin-user.entity';
import { AuthResponseDto, RefreshResponseDto } from '../../../application/dto/auth.dto';

/**
 * 인증 관련 매핑 인터페이스
 */
export interface IAuthMapper {
  /**
   * AdminUser를 AuthResponseDto로 변환 (로그인 응답용)
   */
  toAuthResponseDto(
    user: AdminUser, 
    accessToken: string, 
    refreshToken: string,
    context?: AuthContext
  ): AuthResponseDto;

  /**
   * RefreshResponseDto 생성
   */
  toRefreshResponseDto(
    accessToken: string, 
    refreshToken: string
  ): RefreshResponseDto;

  /**
   * 사용자 프로필 정보 추출 (프로필 조회용)
   */
  toUserProfile(user: AdminUser): UserProfile;

  /**
   * 세션 정보가 포함된 인증 응답 생성
   */
  toAuthResponseWithSession(
    user: AdminUser,
    tokens: TokenPair,
    context: AuthContext
  ): AuthResponseWithSession;
}

/**
 * 인증 컨텍스트 정보
 */
export interface AuthContext {
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    type: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
  };
}

/**
 * 토큰 쌍
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * 사용자 프로필 정보
 */
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 세션 정보가 포함된 인증 응답
 */
export interface AuthResponseWithSession extends AuthResponseDto {
  sessionInfo: SessionInfo;
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * 세션 정보
 */
export interface SessionInfo {
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: string;
  requiresMFA: boolean;
}
