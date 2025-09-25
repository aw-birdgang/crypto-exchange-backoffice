import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { AuditLogService } from '../services/audit-log.service';
import { LogAction, LogCategory, LogSeverity, LogStatus } from '../../domain/entities/audit-log.entity';
import { AdminUser } from '../../../auth/domain/entities/admin-user.entity';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AdminUser;

    // 사용자 정보가 없으면 로깅하지 않음
    if (!user) {
      return next.handle();
    }

    const startTime = Date.now();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const sessionId = this.extractSessionId(request);
    const requestId = this.extractRequestId(request);

    return next.handle().pipe(
      tap(async (response) => {
        const duration = Date.now() - startTime;
        await this.logApiCall(
          user,
          method,
          url,
          ip || 'unknown',
          userAgent,
          sessionId,
          requestId,
          LogStatus.SUCCESS,
          duration,
          response,
        );
      }),
      catchError(async (error) => {
        const duration = Date.now() - startTime;
        await this.logApiCall(
          user,
          method,
          url,
          ip || 'unknown',
          userAgent,
          sessionId,
          requestId,
          LogStatus.FAILURE,
          duration,
          null,
          error,
        );
        throw error;
      }),
    );
  }

  private async logApiCall(
    user: AdminUser,
    method: string,
    url: string,
    ip: string,
    userAgent: string,
    sessionId: string,
    requestId: string,
    status: LogStatus,
    duration: number,
    response?: any,
    error?: any,
  ): Promise<void> {
    try {
      const action = this.determineAction(method, url);
      const resource = this.determineResource(url);
      const severity = this.determineSeverity(status, error);
      const category = this.determineCategory(url);

      const details = {
        method,
        url,
        duration,
        statusCode: response?.statusCode || error?.status || 500,
        timestamp: new Date().toISOString(),
        ...(error && { errorMessage: error.message, errorStack: error.stack }),
      };

      await this.auditLogService.logActivity({
        userId: user.id,
        userEmail: user.email,
        userName: user.username,
        userRole: user.adminRole,
        action,
        resource,
        details,
        ipAddress: ip,
        userAgent,
        sessionId,
        requestId,
        status,
        severity,
        category,
        subcategory: this.getSubcategory(action, url),
        metadata: {
          browser: this.extractBrowser(userAgent),
          os: this.extractOS(userAgent),
          device: this.extractDevice(userAgent),
          duration,
        },
      });
    } catch (logError) {
      this.logger.error(`Failed to log API call: ${logError instanceof Error ? logError.message : 'Unknown error'}`, logError instanceof Error ? logError.stack : undefined);
    }
  }

  private determineAction(method: string, url: string): LogAction {
    // URL 패턴에 따른 액션 결정
    if (url.includes('/auth/login')) return LogAction.LOGIN;
    if (url.includes('/auth/logout')) return LogAction.LOGOUT;
    if (url.includes('/users') && method === 'POST') return LogAction.USER_CREATED;
    if (url.includes('/users') && method === 'PUT') return LogAction.USER_UPDATED;
    if (url.includes('/users') && method === 'DELETE') return LogAction.USER_DELETED;
    if (url.includes('/wallet')) return LogAction.TRANSACTION_VIEWED;
    if (url.includes('/customer')) return LogAction.TICKET_CREATED;
    
    // HTTP 메서드에 따른 기본 액션
    switch (method) {
      case 'GET': return LogAction.DATA_VIEWED;
      case 'POST': return LogAction.DATA_MODIFIED;
      case 'PUT': return LogAction.DATA_MODIFIED;
      case 'PATCH': return LogAction.DATA_MODIFIED;
      case 'DELETE': return LogAction.DATA_DELETED;
      default: return LogAction.DATA_VIEWED;
    }
  }

  private determineResource(url: string): string {
    if (url.includes('/auth')) return 'auth';
    if (url.includes('/users')) return 'user_management';
    if (url.includes('/wallet')) return 'wallet';
    if (url.includes('/customer')) return 'customer_support';
    if (url.includes('/audit-logs')) return 'audit_logs';
    if (url.includes('/permissions')) return 'permissions';
    if (url.includes('/roles')) return 'roles';
    
    return 'api';
  }

  private determineSeverity(status: LogStatus, error?: any): LogSeverity {
    if (status === LogStatus.FAILURE) {
      if (error?.status >= 500) return LogSeverity.HIGH;
      if (error?.status >= 400) return LogSeverity.MEDIUM;
      return LogSeverity.LOW;
    }
    
    return LogSeverity.LOW;
  }

  private determineCategory(url: string): LogCategory {
    if (url.includes('/auth')) return LogCategory.AUTHENTICATION;
    if (url.includes('/users')) return LogCategory.USER_MANAGEMENT;
    if (url.includes('/wallet')) return LogCategory.WALLET_MANAGEMENT;
    if (url.includes('/customer')) return LogCategory.CUSTOMER_SUPPORT;
    if (url.includes('/audit-logs')) return LogCategory.SYSTEM_ADMINISTRATION;
    if (url.includes('/permissions') || url.includes('/roles')) return LogCategory.AUTHORIZATION;
    
    return LogCategory.DATA_ACCESS;
  }

  private getSubcategory(action: LogAction, url: string): string {
    if (url.includes('/login')) return 'login_attempt';
    if (url.includes('/logout')) return 'logout';
    if (url.includes('/approve')) return 'user_approval';
    if (url.includes('/reject')) return 'user_rejection';
    if (url.includes('/suspend')) return 'user_suspension';
    if (url.includes('/activate')) return 'user_activation';
    if (url.includes('/export')) return 'data_export';
    if (url.includes('/bulk')) return 'bulk_operation';
    
    return 'api_call';
  }

  private extractSessionId(request: Request): string {
    return request.headers['x-session-id'] as string || 
           (request as any).sessionID || 
           'unknown';
  }

  private extractRequestId(request: Request): string {
    return request.headers['x-request-id'] as string || 
           request.headers['x-correlation-id'] as string || 
           'unknown';
  }

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
}
