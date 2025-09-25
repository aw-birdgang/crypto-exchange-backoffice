import { Injectable, Logger, Inject } from '@nestjs/common';
import { AuditLogRepositoryInterface } from '../../domain/repositories/audit-log.repository.interface';
import { CreateAuditLogDto } from '../../domain/dto/create-audit-log.dto';
import { AuditLogFiltersDto } from '../../domain/dto/audit-log-filters.dto';
import { PaginatedAuditLogsDto, LogStatisticsDto } from '../../domain/dto/audit-log-response.dto';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { LogAction, LogCategory, LogSeverity, LogStatus } from '../../domain/entities/audit-log.entity';
import { AdminUser } from '../../../auth/domain/entities/admin-user.entity';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @Inject('AuditLogRepositoryInterface')
    private readonly auditLogRepository: AuditLogRepositoryInterface,
  ) {}

  /**
   * 새로운 감사 로그 생성
   */
  async logActivity(logData: CreateAuditLogDto): Promise<AuditLog> {
    try {
      this.logger.debug(`Creating audit log: ${logData.action} by ${logData.userEmail}`);
      return await this.auditLogRepository.create(logData);
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * 로그인 활동 로깅
   */
  async logLogin(user: AdminUser, ipAddress: string, userAgent: string, sessionId: string, requestId: string, success: boolean = true): Promise<AuditLog> {
    const logData: CreateAuditLogDto = {
      userId: user.id,
      userEmail: user.email,
      userName: user.username,
      userRole: user.adminRole,
      action: success ? LogAction.LOGIN : LogAction.LOGIN_FAILED,
      resource: 'auth',
      details: {
        loginTime: new Date().toISOString(),
        success,
        ipAddress,
        userAgent,
      },
      ipAddress,
      userAgent,
      sessionId,
      requestId,
      status: success ? LogStatus.SUCCESS : LogStatus.FAILURE,
      severity: success ? LogSeverity.LOW : LogSeverity.MEDIUM,
      category: LogCategory.AUTHENTICATION,
      subcategory: 'login_attempt',
      metadata: {
        browser: this.extractBrowser(userAgent),
        os: this.extractOS(userAgent),
        device: this.extractDevice(userAgent),
      },
    };

    return await this.logActivity(logData);
  }

  /**
   * 로그아웃 활동 로깅
   */
  async logLogout(user: AdminUser, ipAddress: string, userAgent: string, sessionId: string, requestId: string): Promise<AuditLog> {
    const logData: CreateAuditLogDto = {
      userId: user.id,
      userEmail: user.email,
      userName: user.username,
      userRole: user.adminRole,
      action: LogAction.LOGOUT,
      resource: 'auth',
      details: {
        logoutTime: new Date().toISOString(),
        sessionDuration: this.calculateSessionDuration(sessionId),
      },
      ipAddress,
      userAgent,
      sessionId,
      requestId,
      status: LogStatus.SUCCESS,
      severity: LogSeverity.LOW,
      category: LogCategory.AUTHENTICATION,
      subcategory: 'logout',
      metadata: {
        browser: this.extractBrowser(userAgent),
        os: this.extractOS(userAgent),
      },
    };

    return await this.logActivity(logData);
  }

  /**
   * 권한 거부 활동 로깅
   */
  async logPermissionDenied(user: AdminUser, resource: string, action: string, ipAddress: string, userAgent: string, sessionId: string, requestId: string): Promise<AuditLog> {
    const logData: CreateAuditLogDto = {
      userId: user.id,
      userEmail: user.email,
      userName: user.username,
      userRole: user.adminRole,
      action: LogAction.PERMISSION_DENIED,
      resource,
      details: {
        attemptedAction: action,
        deniedAt: new Date().toISOString(),
        reason: 'Insufficient permissions',
      },
      ipAddress,
      userAgent,
      sessionId,
      requestId,
      status: LogStatus.FAILURE,
      severity: LogSeverity.HIGH,
      category: LogCategory.AUTHORIZATION,
      subcategory: 'permission_denied',
      metadata: {
        browser: this.extractBrowser(userAgent),
        os: this.extractOS(userAgent),
      },
    };

    return await this.logActivity(logData);
  }

  /**
   * 사용자 관리 활동 로깅
   */
  async logUserManagement(user: AdminUser, action: LogAction, targetUserId: string, targetUserEmail: string, details: Record<string, any>, ipAddress: string, userAgent: string, sessionId: string, requestId: string): Promise<AuditLog> {
    const logData: CreateAuditLogDto = {
      userId: user.id,
      userEmail: user.email,
      userName: user.username,
      userRole: user.adminRole,
      action,
      resource: 'user_management',
      details: {
        targetUserId,
        targetUserEmail,
        ...details,
      },
      ipAddress,
      userAgent,
      sessionId,
      requestId,
      status: LogStatus.SUCCESS,
      severity: this.getSeverityForUserAction(action),
      category: LogCategory.USER_MANAGEMENT,
      subcategory: this.getSubcategoryForUserAction(action),
      metadata: {
        browser: this.extractBrowser(userAgent),
        os: this.extractOS(userAgent),
      },
    };

    return await this.logActivity(logData);
  }

  /**
   * 지갑 관리 활동 로깅
   */
  async logWalletActivity(user: AdminUser, action: LogAction, details: Record<string, any>, ipAddress: string, userAgent: string, sessionId: string, requestId: string): Promise<AuditLog> {
    const logData: CreateAuditLogDto = {
      userId: user.id,
      userEmail: user.email,
      userName: user.username,
      userRole: user.adminRole,
      action,
      resource: 'wallet',
      details,
      ipAddress,
      userAgent,
      sessionId,
      requestId,
      status: LogStatus.SUCCESS,
      severity: LogSeverity.MEDIUM,
      category: LogCategory.WALLET_MANAGEMENT,
      subcategory: this.getSubcategoryForWalletAction(action),
      metadata: {
        browser: this.extractBrowser(userAgent),
        os: this.extractOS(userAgent),
      },
    };

    return await this.logActivity(logData);
  }

  /**
   * 고객 지원 활동 로깅
   */
  async logCustomerSupport(user: AdminUser, action: LogAction, ticketId: string, details: Record<string, any>, ipAddress: string, userAgent: string, sessionId: string, requestId: string): Promise<AuditLog> {
    const logData: CreateAuditLogDto = {
      userId: user.id,
      userEmail: user.email,
      userName: user.username,
      userRole: user.adminRole,
      action,
      resource: 'customer_support',
      details: {
        ticketId,
        ...details,
      },
      ipAddress,
      userAgent,
      sessionId,
      requestId,
      status: LogStatus.SUCCESS,
      severity: LogSeverity.MEDIUM,
      category: LogCategory.CUSTOMER_SUPPORT,
      subcategory: this.getSubcategoryForCustomerAction(action),
      metadata: {
        browser: this.extractBrowser(userAgent),
        os: this.extractOS(userAgent),
      },
    };

    return await this.logActivity(logData);
  }

  /**
   * 로그 조회
   */
  async getLogs(filters: AuditLogFiltersDto): Promise<PaginatedAuditLogsDto> {
    try {
      this.logger.debug(`Fetching audit logs with filters: ${JSON.stringify(filters)}`);
      return await this.auditLogRepository.findByFilters(filters);
    } catch (error) {
      this.logger.error(`Failed to fetch audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * 로그 통계 조회
   */
  async getLogStatistics(period: string): Promise<LogStatisticsDto> {
    try {
      this.logger.debug(`Fetching log statistics for period: ${period}`);
      return await this.auditLogRepository.getStatistics(period);
    } catch (error) {
      this.logger.error(`Failed to fetch log statistics: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * 사용자별 최근 활동 조회
   */
  async getUserRecentActivity(userId: string, limit: number = 10): Promise<AuditLog[]> {
    try {
      return await this.auditLogRepository.getRecentActivity(userId, limit);
    } catch (error) {
      this.logger.error(`Failed to fetch user recent activity: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * 의심스러운 활동 탐지
   */
  async detectSuspiciousActivity(userId: string, timeWindow: number = 60): Promise<AuditLog[]> {
    try {
      this.logger.warn(`Detecting suspicious activity for user: ${userId}`);
      return await this.auditLogRepository.detectSuspiciousActivity(userId, timeWindow);
    } catch (error) {
      this.logger.error(`Failed to detect suspicious activity: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * 로그 내보내기
   */
  async exportLogs(filters: AuditLogFiltersDto, format: 'csv' | 'json'): Promise<Buffer> {
    try {
      this.logger.debug(`Exporting audit logs in ${format} format`);
      return await this.auditLogRepository.exportLogs(filters, format);
    } catch (error) {
      this.logger.error(`Failed to export audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * 오래된 로그 정리
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    try {
      this.logger.debug(`Cleaning up logs older than ${retentionDays} days`);
      const deletedCount = await this.auditLogRepository.deleteOldLogs(retentionDays);
      this.logger.log(`Deleted ${deletedCount} old audit logs`);
      return deletedCount;
    } catch (error) {
      this.logger.error(`Failed to cleanup old logs: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // 헬퍼 메서드들
  private extractBrowser(userAgent: string): string {
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
    for (const browser of browsers) {
      if (userAgent.includes(browser)) {
        return browser;
      }
    }
    return 'Unknown';
  }

  private extractOS(userAgent: string): string {
    const osList = ['Windows', 'Mac', 'Linux', 'Android', 'iOS'];
    for (const os of osList) {
      if (userAgent.includes(os)) {
        return os;
      }
    }
    return 'Unknown';
  }

  private extractDevice(userAgent: string): string {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }

  private calculateSessionDuration(sessionId: string): number {
    // 실제 구현에서는 세션 시작 시간을 저장하고 계산
    return 0;
  }

  private getSeverityForUserAction(action: LogAction): LogSeverity {
    const highSeverityActions = [
      LogAction.USER_DELETED,
      LogAction.USER_SUSPENDED,
      LogAction.BULK_ACTION,
    ];

    if (highSeverityActions.includes(action)) {
      return LogSeverity.HIGH;
    }

    return LogSeverity.MEDIUM;
  }

  private getSubcategoryForUserAction(action: LogAction): string {
    const subcategoryMap: Record<string, string> = {
      [LogAction.USER_CREATED]: 'user_creation',
      [LogAction.USER_UPDATED]: 'user_update',
      [LogAction.USER_DELETED]: 'user_deletion',
      [LogAction.USER_APPROVED]: 'user_approval',
      [LogAction.USER_REJECTED]: 'user_rejection',
      [LogAction.USER_SUSPENDED]: 'user_suspension',
      [LogAction.USER_ACTIVATED]: 'user_activation',
      [LogAction.BULK_ACTION]: 'bulk_operation',
    };

    return subcategoryMap[action] || 'user_management';
  }

  private getSubcategoryForWalletAction(action: LogAction): string {
    const subcategoryMap: Record<string, string> = {
      [LogAction.TRANSACTION_VIEWED]: 'transaction_view',
      [LogAction.TRANSACTION_FILTERED]: 'transaction_filter',
      [LogAction.WALLET_BALANCE_VIEWED]: 'balance_view',
      [LogAction.TRANSACTION_EXPORTED]: 'transaction_export',
      [LogAction.WALLET_ANALYSIS]: 'wallet_analysis',
    };

    return subcategoryMap[action] || 'wallet_activity';
  }

  private getSubcategoryForCustomerAction(action: LogAction): string {
    const subcategoryMap: Record<string, string> = {
      [LogAction.TICKET_CREATED]: 'ticket_creation',
      [LogAction.TICKET_UPDATED]: 'ticket_update',
      [LogAction.TICKET_RESOLVED]: 'ticket_resolution',
      [LogAction.TICKET_CLOSED]: 'ticket_closure',
      [LogAction.CUSTOMER_CONTACTED]: 'customer_contact',
    };

    return subcategoryMap[action] || 'customer_support';
  }
}
