import { AdminUser } from '../../domain/entities/admin-user.entity';
import { AuthResponseDto, RefreshResponseDto } from '../dto/auth.dto';

/**
 * 인증 관련 매핑 유틸리티 함수
 */
export class AuthMapper {
  /**
   * AdminUser를 AuthResponseDto로 변환 (로그인 응답용)
   */
  static toAuthResponseDto(
    user: AdminUser, 
    accessToken: string, 
    refreshToken: string
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
  static toRefreshResponseDto(
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
  static toUserProfile(user: AdminUser) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.adminRole,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
