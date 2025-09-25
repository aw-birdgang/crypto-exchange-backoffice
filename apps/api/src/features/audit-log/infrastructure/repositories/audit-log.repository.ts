import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between, LessThan, MoreThan } from 'typeorm';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { CreateAuditLogDto } from '../../domain/dto/create-audit-log.dto';
import { AuditLogFiltersDto } from '../../domain/dto/audit-log-filters.dto';
import { PaginatedAuditLogsDto, LogStatisticsDto } from '../../domain/dto/audit-log-response.dto';
import { AuditLogRepositoryInterface } from '../../domain/repositories/audit-log.repository.interface';
import { LogCategory, LogSeverity, LogStatus } from '../../domain/entities/audit-log.entity';

@Injectable()
export class AuditLogRepository implements AuditLogRepositoryInterface {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(logData: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(logData);
    return await this.auditLogRepository.save(auditLog);
  }

  async findById(id: string): Promise<AuditLog | null> {
    return await this.auditLogRepository.findOne({ where: { id } });
  }

  async findByFilters(filters: AuditLogFiltersDto): Promise<PaginatedAuditLogsDto> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit_log');

    // 필터 조건 적용
    this.applyFilters(queryBuilder, filters);

    // 정렬
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'DESC';
    queryBuilder.orderBy(`audit_log.${sortBy}`, sortOrder);

    // 페이징
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    // 총 개수 조회
    const total = await queryBuilder.getCount();

    // 데이터 조회
    const data = await queryBuilder.getMany();

    return {
      data: data.map(log => this.mapToResponseDto(log)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async findByUserId(userId: string, limit: number = 50): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getStatistics(period: string): Promise<LogStatisticsDto> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit_log')
      .where('audit_log.createdAt >= :startDate', { startDate });

    // 총 로그 수
    const totalLogs = await queryBuilder.getCount();

    // 상태별 통계
    const statusStats = await queryBuilder
      .select('audit_log.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit_log.status')
      .getRawMany();

    const successLogs = statusStats.find(s => s.status === LogStatus.SUCCESS)?.count || 0;
    const failureLogs = statusStats.find(s => s.status === LogStatus.FAILURE)?.count || 0;
    const warningLogs = statusStats.find(s => s.status === LogStatus.WARNING)?.count || 0;

    // 카테고리별 통계
    const categoryStats = await queryBuilder
      .select('audit_log.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit_log.category')
      .getRawMany();

    const categoryStatsMap = categoryStats.reduce((acc, item) => {
      acc[item.category] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    // 심각도별 통계
    const severityStats = await queryBuilder
      .select('audit_log.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit_log.severity')
      .getRawMany();

    const severityStatsMap = severityStats.reduce((acc, item) => {
      acc[item.severity] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    // 사용자별 통계
    const userStats = await queryBuilder
      .select('audit_log.userEmail', 'userEmail')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit_log.userEmail')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const userStatsMap = userStats.reduce((acc, item) => {
      acc[item.userEmail] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    // 시간대별 통계
    const hourlyStats = await queryBuilder
      .select('HOUR(audit_log.createdAt)', 'hour')
      .addSelect('COUNT(*)', 'count')
      .groupBy('HOUR(audit_log.createdAt)')
      .orderBy('hour', 'ASC')
      .getRawMany();

    const hourlyStatsMap = hourlyStats.reduce((acc, item) => {
      acc[`${item.hour.toString().padStart(2, '0')}:00`] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLogs,
      successLogs: parseInt(successLogs),
      failureLogs: parseInt(failureLogs),
      warningLogs: parseInt(warningLogs),
      categoryStats: categoryStatsMap,
      severityStats: severityStatsMap,
      userStats: userStatsMap,
      hourlyStats: hourlyStatsMap,
    };
  }

  async deleteOldLogs(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  async countByCategory(category: string): Promise<number> {
    return await this.auditLogRepository.count({
      where: { category: category as LogCategory },
    });
  }

  async getRecentActivity(userId: string, limit: number = 10): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async detectSuspiciousActivity(userId: string, timeWindow: number): Promise<AuditLog[]> {
    const startTime = new Date(Date.now() - timeWindow * 60 * 1000); // 분 단위

    return await this.auditLogRepository.find({
      where: {
        userId,
        createdAt: MoreThan(startTime),
        severity: LogSeverity.HIGH,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async archiveLogs(beforeDate: Date): Promise<number> {
    // 실제 구현에서는 아카이브 로직을 구현
    // 여기서는 단순히 오래된 로그를 삭제하는 것으로 대체
    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :beforeDate', { beforeDate })
      .execute();

    return result.affected || 0;
  }

  async exportLogs(filters: AuditLogFiltersDto, format: 'csv' | 'json'): Promise<Buffer> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit_log');
    this.applyFilters(queryBuilder, filters);

    const logs = await queryBuilder.getMany();

    if (format === 'json') {
      return Buffer.from(JSON.stringify(logs, null, 2));
    } else {
      // CSV 변환 로직 구현
      const csvData = this.convertToCSV(logs);
      return Buffer.from(csvData);
    }
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<AuditLog>, filters: AuditLogFiltersDto): void {
    if (filters.userId) {
      queryBuilder.andWhere('audit_log.userId = :userId', { userId: filters.userId });
    }

    if (filters.userEmail) {
      queryBuilder.andWhere('audit_log.userEmail LIKE :userEmail', { userEmail: `%${filters.userEmail}%` });
    }

    if (filters.userRole) {
      queryBuilder.andWhere('audit_log.userRole = :userRole', { userRole: filters.userRole });
    }

    if (filters.action) {
      queryBuilder.andWhere('audit_log.action = :action', { action: filters.action });
    }

    if (filters.resource) {
      queryBuilder.andWhere('audit_log.resource = :resource', { resource: filters.resource });
    }

    if (filters.status) {
      queryBuilder.andWhere('audit_log.status = :status', { status: filters.status });
    }

    if (filters.severity) {
      queryBuilder.andWhere('audit_log.severity = :severity', { severity: filters.severity });
    }

    if (filters.category) {
      queryBuilder.andWhere('audit_log.category = :category', { category: filters.category });
    }

    if (filters.subcategory) {
      queryBuilder.andWhere('audit_log.subcategory = :subcategory', { subcategory: filters.subcategory });
    }

    if (filters.ipAddress) {
      queryBuilder.andWhere('audit_log.ipAddress = :ipAddress', { ipAddress: filters.ipAddress });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('audit_log.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('audit_log.createdAt <= :endDate', { endDate: filters.endDate });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(audit_log.userName LIKE :search OR audit_log.userEmail LIKE :search OR audit_log.action LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
  }

  private mapToResponseDto(log: AuditLog): any {
    return {
      id: log.id,
      userId: log.userId,
      userEmail: log.userEmail,
      userName: log.userName,
      userRole: log.userRole,
      action: log.action,
      resource: log.resource,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      sessionId: log.sessionId,
      requestId: log.requestId,
      status: log.status,
      severity: log.severity,
      category: log.category,
      subcategory: log.subcategory,
      metadata: log.metadata,
      createdAt: log.createdAt,
      timestamp: log.timestamp,
    };
  }

  private convertToCSV(logs: AuditLog[]): string {
    if (logs.length === 0) return '';

    const headers = [
      'ID', 'User ID', 'User Email', 'User Name', 'User Role', 'Action', 'Resource',
      'IP Address', 'User Agent', 'Session ID', 'Request ID', 'Status', 'Severity',
      'Category', 'Subcategory', 'Created At', 'Timestamp'
    ];

    const rows = logs.map(log => [
      log.id,
      log.userId,
      log.userEmail,
      log.userName,
      log.userRole,
      log.action,
      log.resource,
      log.ipAddress,
      log.userAgent,
      log.sessionId,
      log.requestId,
      log.status,
      log.severity,
      log.category,
      log.subcategory,
      log.createdAt.toISOString(),
      log.timestamp.toISOString(),
    ]);

    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  }
}
