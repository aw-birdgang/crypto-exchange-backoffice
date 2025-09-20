import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { CacheService } from '../cache/cache.service';

interface RateLimitInfo {
  count: number;
  resetTime: number;
  lastRequest: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

@Injectable()
export class AdvancedRateLimitGuard implements CanActivate {
  private readonly configs: Map<string, RateLimitConfig> = new Map();

  constructor(
    private cacheService: CacheService,
    private configService: ConfigService,
  ) {
    this.initializeConfigs();
  }

  private initializeConfigs(): void {
    // 인증 관련 엔드포인트 - 더 엄격한 제한
    this.configs.set('/auth/login', {
      windowMs: 15 * 60 * 1000, // 15분
      maxRequests: 5, // 5회
      skipSuccessfulRequests: false,
    });

    this.configs.set('/auth/register', {
      windowMs: 60 * 60 * 1000, // 1시간
      maxRequests: 3, // 3회
      skipSuccessfulRequests: false,
    });

    this.configs.set('/auth/refresh', {
      windowMs: 5 * 60 * 1000, // 5분
      maxRequests: 10, // 10회
      skipSuccessfulRequests: true,
    });

    // 일반 API 엔드포인트
    this.configs.set('default', {
      windowMs: 15 * 60 * 1000, // 15분
      maxRequests: 100, // 100회
      skipSuccessfulRequests: false,
    });

    // 관리자 엔드포인트 - 더 관대한 제한
    this.configs.set('/admin', {
      windowMs: 15 * 60 * 1000, // 15분
      maxRequests: 200, // 200회
      skipSuccessfulRequests: false,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const config = this.getConfigForPath(request.path);
    const key = this.generateKey(request, config);
    
    const rateLimitInfo = await this.cacheService.get<RateLimitInfo>(key);

    if (!rateLimitInfo) {
      // 첫 번째 요청
      const newInfo: RateLimitInfo = {
        count: 1,
        resetTime: Date.now() + config.windowMs,
        lastRequest: Date.now(),
      };
      await this.cacheService.set(key, newInfo, Math.ceil(config.windowMs / 1000));
      this.setRateLimitHeaders(response, config.maxRequests, 1, newInfo.resetTime);
      return true;
    }

    // 윈도우가 만료된 경우 리셋
    if (Date.now() > rateLimitInfo.resetTime) {
      const newInfo: RateLimitInfo = {
        count: 1,
        resetTime: Date.now() + config.windowMs,
        lastRequest: Date.now(),
      };
      await this.cacheService.set(key, newInfo, Math.ceil(config.windowMs / 1000));
      this.setRateLimitHeaders(response, config.maxRequests, 1, newInfo.resetTime);
      return true;
    }

    // 요청 간격 체크 (DDoS 방지)
    const timeSinceLastRequest = Date.now() - rateLimitInfo.lastRequest;
    const minInterval = 100; // 최소 100ms 간격

    if (timeSinceLastRequest < minInterval) {
      throw new HttpException(
        {
          message: 'Too Many Requests',
          error: 'Request too frequent',
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 요청 수 제한 체크
    if (rateLimitInfo.count >= config.maxRequests) {
      this.setRateLimitHeaders(response, config.maxRequests, rateLimitInfo.count, rateLimitInfo.resetTime);
      throw new HttpException(
        {
          message: 'Too Many Requests',
          error: 'Rate limit exceeded',
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 카운트 증가
    rateLimitInfo.count++;
    rateLimitInfo.lastRequest = Date.now();
    await this.cacheService.set(key, rateLimitInfo, Math.ceil((rateLimitInfo.resetTime - Date.now()) / 1000));
    this.setRateLimitHeaders(response, config.maxRequests, rateLimitInfo.count, rateLimitInfo.resetTime);

    return true;
  }

  private getConfigForPath(path: string): RateLimitConfig {
    // 정확한 경로 매칭
    for (const [pattern, config] of this.configs) {
      if (path.startsWith(pattern)) {
        return config;
      }
    }
    
    // 기본 설정 반환
    return this.configs.get('default')!;
  }

  private generateKey(request: Request, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator(request);
    }

    const ip = this.getClientIp(request);
    const userAgent = request.get('User-Agent') || '';
    const path = request.path;
    
    // 사용자 ID가 있으면 포함 (인증된 사용자)
    const userId = (request as any).user?.id;
    const identifier = userId ? `user:${userId}` : `ip:${ip}`;
    
    return `rate_limit:${identifier}:${Buffer.from(userAgent).toString('base64').substring(0, 16)}:${path}`;
  }

  private getClientIp(request: Request): string {
    return (
      request.ip ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      (request.connection as { socket?: { remoteAddress?: string } })?.socket?.remoteAddress ||
      'unknown'
    );
  }

  private setRateLimitHeaders(response: Response, limit: number, count: number, resetTime: number): void {
    const remaining = Math.max(0, limit - count);
    const resetTimeSeconds = Math.ceil(resetTime / 1000);

    response.set({
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTimeSeconds.toString(),
      'X-RateLimit-Window': Math.ceil(resetTime / 1000).toString(),
    });
  }
}
