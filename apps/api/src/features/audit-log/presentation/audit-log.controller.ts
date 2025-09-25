import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { AuditLogService } from '../application/services/audit-log.service';
import { AuditLogFiltersDto } from '../domain/dto/audit-log-filters.dto';
import { PaginatedAuditLogsDto, LogStatisticsDto } from '../domain/dto/audit-log-response.dto';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { AdminUserRole } from '@crypto-exchange/shared';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator';
import { AdminUser } from '../../auth/domain/entities/admin-user.entity';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditLogController {
  private readonly logger = new Logger(AuditLogController.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.ADMIN)
  @ApiOperation({ summary: '감사 로그 목록 조회' })
  @ApiResponse({ status: 200, description: '감사 로그 목록 조회 성공', type: PaginatedAuditLogsDto })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async getLogs(
    @Query() filters: AuditLogFiltersDto,
    @CurrentUser() user: AdminUser,
  ): Promise<PaginatedAuditLogsDto> {
    this.logger.log(`User ${user.email} requested audit logs with filters: ${JSON.stringify(filters)}`);
    return await this.auditLogService.getLogs(filters);
  }

  @Get('statistics')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.ADMIN)
  @ApiOperation({ summary: '로그 통계 조회' })
  @ApiQuery({ name: 'period', required: false, description: '통계 기간 (day, week, month, year)', example: 'week' })
  @ApiResponse({ status: 200, description: '로그 통계 조회 성공', type: LogStatisticsDto })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async getStatistics(
    @Query('period') period: string = 'week',
    @CurrentUser() user: AdminUser,
  ): Promise<LogStatisticsDto> {
    this.logger.log(`User ${user.email} requested log statistics for period: ${period}`);
    return await this.auditLogService.getLogStatistics(period);
  }

  @Get('user/:userId/recent')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.ADMIN)
  @ApiOperation({ summary: '사용자별 최근 활동 조회' })
  @ApiResponse({ status: 200, description: '사용자 최근 활동 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async getUserRecentActivity(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 10,
    @CurrentUser() user: AdminUser,
  ) {
    this.logger.log(`User ${user.email} requested recent activity for user: ${userId}`);
    return await this.auditLogService.getUserRecentActivity(userId, limit);
  }

  @Get('user/:userId/suspicious')
  @Roles(AdminUserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '사용자 의심스러운 활동 탐지' })
  @ApiQuery({ name: 'timeWindow', required: false, description: '탐지 시간 윈도우 (분)', example: 60 })
  @ApiResponse({ status: 200, description: '의심스러운 활동 탐지 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async detectSuspiciousActivity(
    @Param('userId') userId: string,
    @Query('timeWindow') timeWindow: number = 60,
    @CurrentUser() user: AdminUser,
  ) {
    this.logger.log(`User ${user.email} requested suspicious activity detection for user: ${userId}`);
    return await this.auditLogService.detectSuspiciousActivity(userId, timeWindow);
  }

  @Get('export')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.ADMIN)
  @ApiOperation({ summary: '로그 내보내기' })
  @ApiQuery({ name: 'format', required: false, description: '내보내기 형식 (csv, json)', example: 'csv' })
  @ApiResponse({ status: 200, description: '로그 내보내기 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async exportLogs(
    @Query() filters: AuditLogFiltersDto,
    @Query('format') format: 'csv' | 'json' = 'csv',
    @Res() res: Response,
    @CurrentUser() user: AdminUser,
  ) {
    this.logger.log(`User ${user.email} requested log export in ${format} format`);
    
    const buffer = await this.auditLogService.exportLogs(filters, format);
    const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
    
    res.set({
      'Content-Type': format === 'csv' ? 'text/csv' : 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });
    
    res.send(buffer);
  }

  @Post('cleanup')
  @Roles(AdminUserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '오래된 로그 정리' })
  @ApiQuery({ name: 'retentionDays', required: false, description: '보존 기간 (일)', example: 365 })
  @ApiResponse({ status: 200, description: '로그 정리 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async cleanupOldLogs(
    @Query('retentionDays') retentionDays: number = 365,
    @CurrentUser() user: AdminUser,
  ) {
    this.logger.log(`User ${user.email} requested log cleanup with retention: ${retentionDays} days`);
    const deletedCount = await this.auditLogService.cleanupOldLogs(retentionDays);
    return {
      message: `Successfully deleted ${deletedCount} old audit logs`,
      deletedCount,
    };
  }
}
