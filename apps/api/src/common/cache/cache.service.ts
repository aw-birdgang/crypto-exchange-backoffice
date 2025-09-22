import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis;

  constructor(private configService: ConfigService) {
    const redisConfig: any = {
      host: this.configService.get<string>('app.redis.host', 'localhost'),
      port: this.configService.get<number>('app.redis.port', 6379),
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    };

    // Redis 비밀번호가 설정된 경우 추가
    const redisPassword = this.configService.get<string>('app.redis.password');
    if (redisPassword) {
      redisConfig.password = redisPassword;
    }

    this.redis = new Redis(redisConfig);

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Failed to get cache key ${key}:`, error);
      return null;
    }
  }

  async set(
    key: string,
    value: any,
    ttlSeconds: number = 3600,
  ): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttlSeconds, serialized);
      return true;
    } catch (error) {
      this.logger.error(`Failed to set cache key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete cache key ${key}:`, error);
      return false;
    }
  }

  async delPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete cache pattern ${pattern}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check cache key ${key}:`, error);
      return false;
    }
  }

  async flushAll(): Promise<boolean> {
    try {
      await this.redis.flushall();
      return true;
    } catch (error) {
      this.logger.error('Failed to flush all cache:', error);
      return false;
    }
  }

  // 캐시 키 생성 헬퍼
  static generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  // TTL 상수
  static readonly TTL = {
    SHORT: 300, // 5분
    MEDIUM: 1800, // 30분
    LONG: 3600, // 1시간
    VERY_LONG: 86400, // 24시간
  } as const;
}
