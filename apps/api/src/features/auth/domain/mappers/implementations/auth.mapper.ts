import { AdminUser } from '../../entities/admin-user.entity';
import { AuthResponseDto, RefreshResponseDto } from '../../../application/dto/auth.dto';
import { AdminUserRole } from '@crypto-exchange/shared';
import { 
  IAuthMapper, 
  AuthContext, 
  TokenPair, 
  UserProfile, 
  AuthResponseWithSession, 
  SessionInfo 
} from '../interfaces/auth.mapper.interface';

/**
 * 인증 관련 매핑 구현체
 */
export class AuthMapper implements IAuthMapper {
  /**
   * AdminUser를 AuthResponseDto로 변환 (로그인 응답용)
   */
  toAuthResponseDto(
    user: AdminUser, 
    accessToken: string, 
    refreshToken: string,
    context?: AuthContext
  ): AuthResponseDto {
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.adminRole,
      },
    };
  }

  /**
   * RefreshResponseDto 생성
   */
  toRefreshResponseDto(
    accessToken: string, 
    refreshToken: string
  ): RefreshResponseDto {
    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * 사용자 프로필 정보 추출 (프로필 조회용)
   */
  toUserProfile(user: AdminUser): UserProfile {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.adminRole,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * 세션 정보가 포함된 인증 응답 생성
   */
  toAuthResponseWithSession(
    user: AdminUser,
    tokens: TokenPair,
    context: AuthContext
  ): AuthResponseWithSession {
    const baseResponse = this.toAuthResponseDto(user, tokens.accessToken, tokens.refreshToken, context);
    const sessionInfo = this.createSessionInfo(user, context);
    const securityLevel = this.calculateSecurityLevel(user, context);

    return {
      ...baseResponse,
      sessionInfo,
      securityLevel
    };
  }

  /**
   * 세션 정보 생성
   */
  private createSessionInfo(user: AdminUser, context: AuthContext): SessionInfo {
    const expiresAt = this.calculateExpiration(user.adminRole);
    const requiresMFA = this.requiresMFA(user, context);

    return {
      sessionId: context.sessionId || this.generateSessionId(),
      ipAddress: context.ipAddress || 'unknown',
      userAgent: context.userAgent || 'unknown',
      expiresAt: expiresAt.toISOString(),
      requiresMFA
    };
  }

  /**
   * 보안 레벨 계산
   */
  private calculateSecurityLevel(user: AdminUser, context: AuthContext): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (user.adminRole === AdminUserRole.SUPER_ADMIN) {
      return 'CRITICAL';
    }
    
    if (user.adminRole === AdminUserRole.ADMIN) {
      return 'HIGH';
    }
    
    if (context.ipAddress && this.isNewIpAddress(user, context.ipAddress)) {
      return 'MEDIUM';
    }
    
    if (context.userAgent && this.isNewUserAgent(user, context.userAgent)) {
      return 'MEDIUM';
    }
    
    return 'LOW';
  }

  /**
   * 세션 만료 시간 계산
   */
  private calculateExpiration(role: AdminUserRole): Date {
    const now = new Date();
    const expirationHours = this.getExpirationHours(role);
    return new Date(now.getTime() + expirationHours * 60 * 60 * 1000);
  }

  /**
   * 역할별 세션 만료 시간 (시간)
   */
  private getExpirationHours(role: AdminUserRole): number {
    const expirationMap: Record<AdminUserRole, number> = {
      [AdminUserRole.SUPER_ADMIN]: 2,    // 2시간
      [AdminUserRole.ADMIN]: 4,          // 4시간
      [AdminUserRole.MODERATOR]: 8,      // 8시간
      [AdminUserRole.SUPPORT]: 12,       // 12시간
      [AdminUserRole.AUDITOR]: 24        // 24시간
    };
    return expirationMap[role] || 8;
  }

  /**
   * MFA 필요 여부 확인
   */
  private requiresMFA(user: AdminUser, context: AuthContext): boolean {
    // SUPER_ADMIN은 항상 MFA 필요
    if (user.adminRole === AdminUserRole.SUPER_ADMIN) {
      return true;
    }
    
    // 새로운 IP에서 접근하는 경우
    if (context.ipAddress && this.isNewIpAddress(user, context.ipAddress)) {
      return true;
    }
    
    // 새로운 디바이스에서 접근하는 경우
    if (context.userAgent && this.isNewUserAgent(user, context.userAgent)) {
      return true;
    }
    
    return false;
  }

  /**
   * 새로운 IP 주소인지 확인
   */
  private isNewIpAddress(user: AdminUser, ipAddress: string): boolean {
    // 실제 구현에서는 사용자의 마지막 IP 주소와 비교
    // 여기서는 간단히 예시로 처리
    return true; // 실제로는 데이터베이스에서 확인
  }

  /**
   * 새로운 User Agent인지 확인
   */
  private isNewUserAgent(user: AdminUser, userAgent: string): boolean {
    // 실제 구현에서는 사용자의 마지막 User Agent와 비교
    // 여기서는 간단히 예시로 처리
    return true; // 실제로는 데이터베이스에서 확인
  }

  /**
   * 세션 ID 생성
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
