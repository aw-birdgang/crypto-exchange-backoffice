import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { 
  ErrorResponse, 
  ExtendedApiError, 
  ErrorSeverity, 
  ErrorCategory,
  ErrorCode,
  getErrorMessage,
  getErrorSeverity,
  getErrorCategory,
  getHttpStatusFromErrorCode
} from '@crypto-exchange/shared';
import { EnhancedBusinessException } from './enhanced-business.exception';

@Catch()
export class EnhancedHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(EnhancedHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);
    const status = errorResponse.error.status;

    // 로그 레벨 결정
    this.logError(exception, request, status, errorResponse.error);

    response.status(status).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, request: Request): ErrorResponse {
    // 향상된 비즈니스 예외인 경우
    if (exception instanceof EnhancedBusinessException) {
      return {
        success: false,
        error: {
          code: exception.errorCode,
          message: exception.message,
          status: exception.getStatus(),
          severity: exception.severity,
          category: exception.category,
          details: exception.details,
          timestamp: new Date().toISOString(),
          requestId: exception.requestId || this.generateRequestId(request),
        },
        data: null,
        timestamp: new Date().toISOString(),
      };
    }

    // 기존 NestJS HttpException인 경우
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      
      let message: string;
      let details: Record<string, unknown> | undefined;

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        const responseObj = response as any;
        message = responseObj.message || exception.message;
        details = responseObj.details;
      } else {
        message = exception.message;
      }

      // 기존 예외를 에러코드로 매핑
      const errorCode = this.mapHttpExceptionToErrorCode(exception, status);
      
      return {
        success: false,
        error: {
          code: errorCode,
          message: getErrorMessage(errorCode),
          status,
          severity: getErrorSeverity(errorCode),
          category: getErrorCategory(errorCode),
          details,
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(request),
        },
        data: null,
        timestamp: new Date().toISOString(),
      };
    }

    // 데이터베이스 관련 에러
    if (exception instanceof Error) {
      const errorCode = this.mapDatabaseErrorToErrorCode(exception);
      
      return {
        success: false,
        error: {
          code: errorCode,
          message: getErrorMessage(errorCode),
          status: getHttpStatusFromErrorCode(errorCode),
          severity: getErrorSeverity(errorCode),
          category: getErrorCategory(errorCode),
          details: {
            name: exception.name,
            message: exception.message,
            ...(process.env.NODE_ENV === 'development' && {
              stack: exception.stack,
            }),
          },
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(request),
        },
        data: null,
        timestamp: new Date().toISOString(),
      };
    }

    // 알 수 없는 에러
    return {
      success: false,
      error: {
        code: 'SYSTEM_INTERNAL_INTERNAL_SERVER_ERROR',
        message: '알 수 없는 오류가 발생했습니다.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        severity: ErrorSeverity.CRITICAL,
        category: ErrorCategory.SYSTEM,
        details: {
          type: typeof exception,
          value: String(exception),
        },
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(request),
      },
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  private mapHttpExceptionToErrorCode(exception: HttpException, status: number): ErrorCode {
    const message = exception.message.toLowerCase();
    
    // 401 Unauthorized
    if (status === 401) {
      if (message.includes('token')) {
        if (message.includes('missing')) return 'AUTH_AUTH_TOKEN_MISSING' as ErrorCode;
        if (message.includes('invalid')) return 'AUTH_AUTH_TOKEN_INVALID' as ErrorCode;
        if (message.includes('expired')) return 'AUTH_AUTH_TOKEN_EXPIRED' as ErrorCode;
        return 'AUTH_AUTH_INVALID_CREDENTIALS' as ErrorCode;
      }
      return 'AUTH_AUTH_INVALID_CREDENTIALS' as ErrorCode;
    }

    // 403 Forbidden
    if (status === 403) {
      if (message.includes('permission')) return 'AUTH_AUTHZ_PERMISSION_DENIED' as ErrorCode;
      if (message.includes('role')) return 'AUTH_AUTHZ_ROLE_REQUIRED' as ErrorCode;
      return 'AUTH_AUTHZ_INSUFFICIENT_PERMISSIONS' as ErrorCode;
    }

    // 404 Not Found
    if (status === 404) {
      if (message.includes('user')) return 'USER_NOT_FOUND_USER_NOT_FOUND' as ErrorCode;
      if (message.includes('role')) return 'PERMISSION_NOT_FOUND_ROLE_NOT_FOUND' as ErrorCode;
      if (message.includes('permission')) return 'PERMISSION_NOT_FOUND_PERMISSION_NOT_FOUND' as ErrorCode;
      if (message.includes('wallet')) return 'WALLET_NOT_FOUND_WALLET_NOT_FOUND' as ErrorCode;
      if (message.includes('transaction')) return 'WALLET_NOT_FOUND_TRANSACTION_NOT_FOUND' as ErrorCode;
      if (message.includes('inquiry')) return 'CUSTOMER_NOT_FOUND_INQUIRY_NOT_FOUND' as ErrorCode;
      if (message.includes('ticket')) return 'CUSTOMER_NOT_FOUND_TICKET_NOT_FOUND' as ErrorCode;
      return 'SYSTEM_NOT_FOUND_FILE_NOT_FOUND' as ErrorCode;
    }

    // 409 Conflict
    if (status === 409) {
      if (message.includes('email')) return 'USER_CONFLICT_USER_EMAIL_DUPLICATE' as ErrorCode;
      if (message.includes('user')) return 'USER_CONFLICT_USER_ALREADY_EXISTS' as ErrorCode;
      if (message.includes('role')) return 'PERMISSION_CONFLICT_ROLE_ALREADY_EXISTS' as ErrorCode;
      return 'USER_CONFLICT_USER_ALREADY_EXISTS' as ErrorCode;
    }

    // 422 Unprocessable Entity
    if (status === 422) {
      if (message.includes('email')) return 'VALIDATION_INVALID_INVALID_EMAIL_FORMAT' as ErrorCode;
      if (message.includes('password')) return 'VALIDATION_INVALID_INVALID_PASSWORD_FORMAT' as ErrorCode;
      if (message.includes('required')) return 'VALIDATION_INVALID_REQUIRED_FIELD_MISSING' as ErrorCode;
      return 'VALIDATION_INVALID_INVALID_DATA_TYPE' as ErrorCode;
    }

    // 429 Too Many Requests
    if (status === 429) {
      return 'RATE_LIMIT_RATE_LIMIT_RATE_LIMIT_EXCEEDED' as ErrorCode;
    }

    // 500 Internal Server Error
    if (status >= 500) {
      return 'SYSTEM_INTERNAL_INTERNAL_SERVER_ERROR' as ErrorCode;
    }

    // 기본값
    return 'SYSTEM_INTERNAL_INTERNAL_SERVER_ERROR' as ErrorCode;
  }

  private mapDatabaseErrorToErrorCode(exception: Error): ErrorCode {
    const message = exception.message.toLowerCase();
    
    if (message.includes('duplicate key') || message.includes('unique constraint')) {
      return 'USER_CONFLICT_USER_ALREADY_EXISTS' as ErrorCode;
    }
    
    if (message.includes('foreign key') || message.includes('constraint')) {
      return 'SYSTEM_INTERNAL_DATABASE_CONSTRAINT_VIOLATION' as ErrorCode;
    }
    
    if (message.includes('connection') || message.includes('timeout')) {
      return 'SYSTEM_INTERNAL_DATABASE_CONNECTION_FAILED' as ErrorCode;
    }
    
    if (message.includes('not found') || message.includes('does not exist')) {
      return 'USER_NOT_FOUND_USER_NOT_FOUND' as ErrorCode;
    }
    
    return 'SYSTEM_INTERNAL_DATABASE_QUERY_FAILED' as ErrorCode;
  }

  private generateRequestId(request: Request): string {
    return request.headers['x-request-id'] as string || 
           `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(
    exception: unknown, 
    request: Request, 
    status: number, 
    error: ExtendedApiError
  ): void {
    const logMessage = `${request.method} ${request.url} - ${status} - ${error.message}`;
    const logContext = {
      requestId: error.requestId,
      errorCode: error.code,
      severity: error.severity,
      category: error.category,
      details: error.details,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    };

    if (error.severity === ErrorSeverity.CRITICAL || status >= 500) {
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : undefined,
        logContext
      );
    } else if (error.severity === ErrorSeverity.HIGH || status >= 400) {
      this.logger.warn(logMessage, logContext);
    } else {
      this.logger.log(logMessage, logContext);
    }
  }
}
