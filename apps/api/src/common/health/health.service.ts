import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CacheService } from '../cache/cache.service';
import { LoggerService } from '../logger/logger.service';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
}

export interface DetailedHealthStatus extends HealthStatus {
  dependencies: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    cache: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  constructor(
    private configService: ConfigService,
    @InjectDataSource()
    private dataSource: DataSource,
    private cacheService: CacheService,
    private logger: LoggerService,
  ) {}

  async getHealthStatus(): Promise<HealthStatus> {
    const uptime = Date.now() - this.startTime;
    const version = this.configService.get<string>('app.version', '1.0.0');
    const environment = this.configService.get<string>('app.nodeEnv', 'development');

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime,
      version,
      environment,
    };
  }

  async getDetailedHealthStatus(): Promise<DetailedHealthStatus> {
    const basicStatus = await this.getHealthStatus();
    
    // 데이터베이스 상태 확인
    const databaseStatus = await this.checkDatabase();
    
    // 캐시 상태 확인
    const cacheStatus = await this.checkCache();
    
    // 메모리 사용량 확인
    const memory = this.getMemoryUsage();
    
    // CPU 사용량 확인 (Node.js에서는 제한적)
    const cpu = this.getCpuUsage();

    const overallStatus = databaseStatus.status === 'healthy' && cacheStatus.status === 'healthy' 
      ? 'healthy' 
      : 'unhealthy';

    return {
      ...basicStatus,
      status: overallStatus,
      dependencies: {
        database: databaseStatus,
        cache: cacheStatus,
      },
      memory,
      cpu,
    };
  }

  async getReadinessStatus(): Promise<{ status: 'ready' | 'not_ready' }> {
    const databaseStatus = await this.checkDatabase();
    const cacheStatus = await this.checkCache();

    const isReady = databaseStatus.status === 'healthy' && cacheStatus.status === 'healthy';

    if (!isReady) {
      this.logger.warn('Service not ready', {
        database: databaseStatus.status,
        cache: cacheStatus.status,
        type: 'readiness_check',
      });
    }

    return {
      status: isReady ? 'ready' : 'not_ready',
    };
  }

  async getLivenessStatus(): Promise<{ status: 'alive' | 'not_alive' }> {
    // 기본적인 생존 확인
    const memory = this.getMemoryUsage();
    const isAlive = memory.percentage < 90; // 메모리 사용률이 90% 미만

    if (!isAlive) {
      this.logger.error('Service not alive - high memory usage', undefined, {
        memoryUsage: memory.percentage,
        type: 'liveness_check',
      });
    }

    return {
      status: isAlive ? 'alive' : 'not_alive',
    };
  }

  private async checkDatabase(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
    error?: string;
  }> {
    const start = Date.now();
    
    try {
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - start;
      
      this.logger.error('Database health check failed', (error as Error).message, {
        responseTime,
        type: 'health_check',
      });

      return {
        status: 'unhealthy',
        responseTime,
        error: (error as Error).message,
      };
    }
  }

  private async checkCache(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
    error?: string;
  }> {
    const start = Date.now();
    
    try {
      await this.cacheService.set('health_check', 'ok', 10);
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - start;
      
      this.logger.error('Cache health check failed', (error as Error).message, {
        responseTime,
        type: 'health_check',
      });

      return {
        status: 'unhealthy',
        responseTime,
        error: (error as Error).message,
      };
    }
  }

  private getMemoryUsage(): { used: number; total: number; percentage: number } {
    const usage = process.memoryUsage();
    const total = usage.heapTotal;
    const used = usage.heapUsed;
    const percentage = (used / total) * 100;

    return {
      used: Math.round(used / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
      percentage: Math.round(percentage * 100) / 100,
    };
  }

  private getCpuUsage(): { usage: number } {
    // Node.js에서는 CPU 사용률을 정확히 측정하기 어려움
    // 실제 운영 환경에서는 별도의 모니터링 도구 사용 권장
    return {
      usage: 0, // Placeholder
    };
  }
}
