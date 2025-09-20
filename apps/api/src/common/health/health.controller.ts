import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: '기본 헬스체크',
    description: '서비스의 기본 상태를 확인합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '서비스가 정상 작동 중',
    example: {
      status: 'ok',
      info: {
        database: { status: 'up' },
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' }
      },
      error: {},
      details: {
        database: { status: 'up' },
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' }
      }
    }
  })
  async check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
    ]);
  }

  @Get('detailed')
  @HealthCheck()
  @ApiOperation({
    summary: '상세 헬스체크',
    description: '서비스의 상세 상태와 의존성을 확인합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '상세 헬스체크 결과',
    example: {
      status: 'ok',
      info: {
        database: { status: 'up' },
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' },
        storage: { status: 'up' }
      },
      error: {},
      details: {
        database: { status: 'up' },
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' },
        storage: { status: 'up' }
      }
    }
  })
  async detailed() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({
    summary: 'Kubernetes Readiness Probe',
    description: 'Kubernetes에서 사용하는 readiness probe 엔드포인트'
  })
  @ApiResponse({
    status: 200,
    description: '서비스가 준비됨',
    example: { status: 'ok' }
  })
  @ApiResponse({
    status: 503,
    description: '서비스가 준비되지 않음',
    example: { status: 'error' }
  })
  async ready() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }

  @Get('live')
  @HealthCheck()
  @ApiOperation({
    summary: 'Kubernetes Liveness Probe',
    description: 'Kubernetes에서 사용하는 liveness probe 엔드포인트'
  })
  @ApiResponse({
    status: 200,
    description: '서비스가 살아있음',
    example: { status: 'ok' }
  })
  @ApiResponse({
    status: 503,
    description: '서비스가 살아있지 않음',
    example: { status: 'error' }
  })
  async live() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }

  @Get('legacy')
  @ApiOperation({
    summary: '레거시 헬스체크',
    description: '기존 커스텀 헬스체크 서비스를 사용합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '레거시 헬스체크 결과',
    example: {
      status: 'healthy',
      timestamp: '2025-09-20T05:00:21.691Z',
      uptime: 1234567,
      version: '1.0.0',
      environment: 'development'
    }
  })
  async getLegacyHealth() {
    return this.healthService.getHealthStatus();
  }

  @Get('legacy/detailed')
  @ApiOperation({
    summary: '레거시 상세 헬스체크',
    description: '기존 커스텀 상세 헬스체크 서비스를 사용합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '레거시 상세 헬스체크 결과',
    example: {
      status: 'healthy',
      timestamp: '2025-09-20T05:00:21.691Z',
      uptime: 1234567,
      version: '1.0.0',
      environment: 'development',
      dependencies: {
        database: {
          status: 'healthy',
          responseTime: 15
        },
        cache: {
          status: 'healthy',
          responseTime: 5
        }
      },
      memory: {
        used: 45,
        total: 128,
        percentage: 35.16
      },
      cpu: {
        usage: 0
      }
    }
  })
  async getLegacyDetailedHealth() {
    return this.healthService.getDetailedHealthStatus();
  }
}
