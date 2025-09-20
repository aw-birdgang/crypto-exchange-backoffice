import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { CacheService } from '../cache/cache.service';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private cacheService: CacheService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const key = this.generateKey(request);
    const limit = this.configService.get<number>('app.security.rateLimit.limit', 100);
    const windowMs = this.configService.get<number>('app.security.rateLimit.windowMs', 900000); // 15 minutes

    const rateLimitInfo = await this.cacheService.get<RateLimitInfo>(key);

    if (!rateLimitInfo) {
      // First request in window
      const newInfo: RateLimitInfo = {
        count: 1,
        resetTime: Date.now() + windowMs,
      };
      await this.cacheService.set(key, newInfo, Math.ceil(windowMs / 1000));
      this.setRateLimitHeaders(response, limit, 1, newInfo.resetTime);
      return true;
    }

    if (Date.now() > rateLimitInfo.resetTime) {
      // Window has expired, reset
      const newInfo: RateLimitInfo = {
        count: 1,
        resetTime: Date.now() + windowMs,
      };
      await this.cacheService.set(key, newInfo, Math.ceil(windowMs / 1000));
      this.setRateLimitHeaders(response, limit, 1, newInfo.resetTime);
      return true;
    }

    if (rateLimitInfo.count >= limit) {
      // Rate limit exceeded
      this.setRateLimitHeaders(response, limit, rateLimitInfo.count, rateLimitInfo.resetTime);
      throw new HttpException(
        {
          message: 'Too Many Requests',
          error: 'Rate limit exceeded',
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment count
    rateLimitInfo.count++;
    await this.cacheService.set(key, rateLimitInfo, Math.ceil((rateLimitInfo.resetTime - Date.now()) / 1000));
    this.setRateLimitHeaders(response, limit, rateLimitInfo.count, rateLimitInfo.resetTime);

    return true;
  }

  private generateKey(request: Request): string {
    const ip = this.getClientIp(request);
    const userAgent = request.get('User-Agent') || '';
    const path = request.path;
    
    // Create a hash of IP + User-Agent + Path for more granular rate limiting
    return `rate_limit:${ip}:${Buffer.from(userAgent).toString('base64')}:${path}`;
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
    });
  }
}
