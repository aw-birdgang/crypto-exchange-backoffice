import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from '../application/services/audit-log.service';
import { AuditLogRepository } from '../infrastructure/repositories/audit-log.repository';
import { AuditLog } from '../domain/entities/audit-log.entity';
import { LogCategoryEntity } from '../domain/entities/log-category.entity';
import { AuditLogRepositoryInterface } from '../domain/repositories/audit-log.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, LogCategoryEntity]),
  ],
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    {
      provide: 'AuditLogRepositoryInterface',
      useClass: AuditLogRepository,
    },
  ],
  exports: [
    AuditLogService,
    'AuditLogRepositoryInterface',
  ],
})
export class AuditLogModule {}
