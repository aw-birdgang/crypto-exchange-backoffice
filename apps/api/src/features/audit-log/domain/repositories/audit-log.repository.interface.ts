import { AuditLog } from '../entities/audit-log.entity';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import { AuditLogFiltersDto } from '../dto/audit-log-filters.dto';
import { PaginatedAuditLogsDto, LogStatisticsDto } from '../dto/audit-log-response.dto';

export interface AuditLogRepositoryInterface {
  /**
   * 새로운 감사 로그 생성
   */
  create(logData: CreateAuditLogDto): Promise<AuditLog>;

  /**
   * 로그 ID로 조회
   */
  findById(id: string): Promise<AuditLog | null>;

  /**
   * 필터 조건으로 로그 목록 조회
   */
  findByFilters(filters: AuditLogFiltersDto): Promise<PaginatedAuditLogsDto>;

  /**
   * 사용자별 로그 조회
   */
  findByUserId(userId: string, limit?: number): Promise<AuditLog[]>;

  /**
   * 특정 기간의 로그 조회
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]>;

  /**
   * 로그 통계 조회
   */
  getStatistics(period: string): Promise<LogStatisticsDto>;

  /**
   * 오래된 로그 삭제 (보존 기간 만료)
   */
  deleteOldLogs(retentionDays: number): Promise<number>;

  /**
   * 특정 카테고리의 로그 수 조회
   */
  countByCategory(category: string): Promise<number>;

  /**
   * 특정 사용자의 최근 활동 조회
   */
  getRecentActivity(userId: string, limit?: number): Promise<AuditLog[]>;

  /**
   * 의심스러운 활동 탐지
   */
  detectSuspiciousActivity(userId: string, timeWindow: number): Promise<AuditLog[]>;

  /**
   * 로그 아카이브 (백업)
   */
  archiveLogs(beforeDate: Date): Promise<number>;

  /**
   * 로그 내보내기
   */
  exportLogs(filters: AuditLogFiltersDto, format: 'csv' | 'json'): Promise<Buffer>;
}
