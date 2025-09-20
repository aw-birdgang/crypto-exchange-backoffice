import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class JwtSecurityService {
  private readonly blacklistedTokens = new Set<string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 강력한 JWT 시크릿 키 생성
   */
  generateSecureSecret(): string {
    return randomBytes(64).toString('hex');
  }

  /**
   * JWT 토큰 검증 및 보안 체크
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // 블랙리스트 체크
      if (this.blacklistedTokens.has(token)) {
        return false;
      }

      // 토큰 검증
      await this.jwtService.verifyAsync(token);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 토큰을 블랙리스트에 추가 (로그아웃 시)
   */
  blacklistToken(token: string): void {
    this.blacklistedTokens.add(token);
    
    // 메모리 정리를 위해 24시간 후 제거
    setTimeout(() => {
      this.blacklistedTokens.delete(token);
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * 토큰의 남은 시간 계산
   */
  getTokenRemainingTime(token: string): number {
    try {
      const decoded = this.jwtService.decode(token) as any;
      if (decoded && decoded.exp) {
        const now = Math.floor(Date.now() / 1000);
        return Math.max(0, decoded.exp - now);
      }
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * 토큰 해시 생성 (로그 추적용)
   */
  getTokenHash(token: string): string {
    return createHash('sha256').update(token).digest('hex').substring(0, 16);
  }

  /**
   * 보안 헤더 생성
   */
  generateSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    };
  }

  /**
   * JWT 설정 검증
   */
  validateJwtConfig(): boolean {
    const secret = this.configService.get<string>('jwt.secret');
    const expiresIn = this.configService.get<string>('jwt.expiresIn');
    
    // 기본값이 아닌지 확인
    if (secret === 'your-super-secret-jwt-key-change-in-production') {
      return false;
    }
    
    // 시크릿 키 길이 확인
    if (!secret || secret.length < 32) {
      return false;
    }
    
    // 만료 시간 확인
    if (!expiresIn || expiresIn === '24h') {
      return false;
    }
    
    return true;
  }
}
