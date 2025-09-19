import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { LoggerModule } from '../logger/logger.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [LoggerModule, CacheModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
