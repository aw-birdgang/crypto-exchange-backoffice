import { HttpException, HttpStatus } from '@nestjs/common';
import { 
  ErrorCode, 
  ExtendedApiError, 
  ErrorSeverity, 
  ErrorCategory,
  getErrorMessage,
  getErrorSeverity,
  getErrorCategory,
  getHttpStatusFromErrorCode
} from '@crypto-exchange/shared';

/**
 * 향상된 비즈니스 예외 클래스
 * 에러코드 시스템을 사용하여 구조화된 에러 처리
 */
export class EnhancedBusinessException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly details?: Record<string, unknown>;
  public readonly requestId?: string;

  constructor(
    errorCode: ErrorCode,
    details?: Record<string, unknown>,
    requestId?: string,
  ) {
    const message = getErrorMessage(errorCode);
    const status = getHttpStatusFromErrorCode(errorCode);
    const severity = getErrorSeverity(errorCode);
    const category = getErrorCategory(errorCode);

    const errorResponse: ExtendedApiError = {
      code: errorCode,
      message,
      status,
      severity,
      category,
      details,
      timestamp: new Date().toISOString(),
      requestId,
    };

    super(
      {
        success: false,
        error: errorResponse,
        data: null,
        timestamp: errorResponse.timestamp,
      },
      status,
    );

    this.errorCode = errorCode;
    this.severity = severity;
    this.category = category;
    this.details = details;
    this.requestId = requestId;
  }
}

/**
 * 인증 관련 예외
 */
export class AuthException extends EnhancedBusinessException {
  constructor(errorCode: ErrorCode, details?: Record<string, unknown>, requestId?: string) {
    super(errorCode, details, requestId);
  }
}

/**
 * 사용자 관리 관련 예외
 */
export class UserException extends EnhancedBusinessException {
  constructor(errorCode: ErrorCode, details?: Record<string, unknown>, requestId?: string) {
    super(errorCode, details, requestId);
  }
}

/**
 * 권한 관리 관련 예외
 */
export class PermissionException extends EnhancedBusinessException {
  constructor(errorCode: ErrorCode, details?: Record<string, unknown>, requestId?: string) {
    super(errorCode, details, requestId);
  }
}

/**
 * 지갑/거래 관련 예외
 */
export class WalletException extends EnhancedBusinessException {
  constructor(errorCode: ErrorCode, details?: Record<string, unknown>, requestId?: string) {
    super(errorCode, details, requestId);
  }
}

/**
 * 고객 지원 관련 예외
 */
export class CustomerException extends EnhancedBusinessException {
  constructor(errorCode: ErrorCode, details?: Record<string, unknown>, requestId?: string) {
    super(errorCode, details, requestId);
  }
}

/**
 * 시스템 관련 예외
 */
export class SystemException extends EnhancedBusinessException {
  constructor(errorCode: ErrorCode, details?: Record<string, unknown>, requestId?: string) {
    super(errorCode, details, requestId);
  }
}

/**
 * 입력 검증 관련 예외
 */
export class ValidationException extends EnhancedBusinessException {
  constructor(errorCode: ErrorCode, details?: Record<string, unknown>, requestId?: string) {
    super(errorCode, details, requestId);
  }
}

/**
 * 네트워크 관련 예외
 */
export class NetworkException extends EnhancedBusinessException {
  constructor(errorCode: ErrorCode, details?: Record<string, unknown>, requestId?: string) {
    super(errorCode, details, requestId);
  }
}

/**
 * 요청 제한 관련 예외
 */
export class RateLimitException extends EnhancedBusinessException {
  constructor(errorCode: ErrorCode, details?: Record<string, unknown>, requestId?: string) {
    super(errorCode, details, requestId);
  }
}

/**
 * 에러코드별 예외 생성 헬퍼 함수들
 */
export class ExceptionFactory {
  // 인증 관련
  static invalidCredentials(details?: Record<string, unknown>, requestId?: string): AuthException {
    return new AuthException('AUTH_AUTH_INVALID_CREDENTIALS', details, requestId);
  }

  static tokenMissing(details?: Record<string, unknown>, requestId?: string): AuthException {
    return new AuthException('AUTH_AUTH_TOKEN_MISSING', details, requestId);
  }

  static tokenInvalid(details?: Record<string, unknown>, requestId?: string): AuthException {
    return new AuthException('AUTH_AUTH_TOKEN_INVALID', details, requestId);
  }

  static tokenExpired(details?: Record<string, unknown>, requestId?: string): AuthException {
    return new AuthException('AUTH_AUTH_TOKEN_EXPIRED', details, requestId);
  }

  static accountPending(details?: Record<string, unknown>, requestId?: string): AuthException {
    return new AuthException('AUTH_AUTH_ACCOUNT_PENDING', details, requestId);
  }

  static accountDeactivated(details?: Record<string, unknown>, requestId?: string): AuthException {
    return new AuthException('AUTH_AUTH_ACCOUNT_DEACTIVATED', details, requestId);
  }

  static insufficientPermissions(details?: Record<string, unknown>, requestId?: string): AuthException {
    return new AuthException('AUTH_AUTHZ_INSUFFICIENT_PERMISSIONS', details, requestId);
  }

  // 사용자 관리 관련
  static userNotFound(details?: Record<string, unknown>, requestId?: string): UserException {
    return new UserException('USER_NOT_FOUND_USER_NOT_FOUND', details, requestId);
  }

  static userAlreadyExists(details?: Record<string, unknown>, requestId?: string): UserException {
    return new UserException('USER_CONFLICT_USER_ALREADY_EXISTS', details, requestId);
  }

  static emailDuplicate(details?: Record<string, unknown>, requestId?: string): UserException {
    return new UserException('USER_CONFLICT_USER_EMAIL_DUPLICATE', details, requestId);
  }

  static userAlreadyApproved(details?: Record<string, unknown>, requestId?: string): UserException {
    return new UserException('USER_CONFLICT_USER_ALREADY_APPROVED', details, requestId);
  }

  static userAlreadyRejected(details?: Record<string, unknown>, requestId?: string): UserException {
    return new UserException('USER_CONFLICT_USER_ALREADY_REJECTED', details, requestId);
  }

  // 권한 관리 관련
  static permissionNotFound(details?: Record<string, unknown>, requestId?: string): PermissionException {
    return new PermissionException('PERMISSION_NOT_FOUND_PERMISSION_NOT_FOUND', details, requestId);
  }

  static roleNotFound(details?: Record<string, unknown>, requestId?: string): PermissionException {
    return new PermissionException('PERMISSION_NOT_FOUND_ROLE_NOT_FOUND', details, requestId);
  }

  static roleAlreadyExists(details?: Record<string, unknown>, requestId?: string): PermissionException {
    return new PermissionException('PERMISSION_CONFLICT_ROLE_ALREADY_EXISTS', details, requestId);
  }

  // 지갑 관련
  static walletNotFound(details?: Record<string, unknown>, requestId?: string): WalletException {
    return new WalletException('WALLET_NOT_FOUND_WALLET_NOT_FOUND', details, requestId);
  }

  static insufficientBalance(details?: Record<string, unknown>, requestId?: string): WalletException {
    return new WalletException('WALLET_INVALID_INSUFFICIENT_BALANCE', details, requestId);
  }

  static transactionNotFound(details?: Record<string, unknown>, requestId?: string): WalletException {
    return new WalletException('WALLET_NOT_FOUND_TRANSACTION_NOT_FOUND', details, requestId);
  }

  // 고객 지원 관련
  static inquiryNotFound(details?: Record<string, unknown>, requestId?: string): CustomerException {
    return new CustomerException('CUSTOMER_NOT_FOUND_INQUIRY_NOT_FOUND', details, requestId);
  }

  static ticketNotFound(details?: Record<string, unknown>, requestId?: string): CustomerException {
    return new CustomerException('CUSTOMER_NOT_FOUND_TICKET_NOT_FOUND', details, requestId);
  }

  // 시스템 관련
  static databaseConnectionFailed(details?: Record<string, unknown>, requestId?: string): SystemException {
    return new SystemException('SYSTEM_INTERNAL_DATABASE_CONNECTION_FAILED', details, requestId);
  }

  static internalServerError(details?: Record<string, unknown>, requestId?: string): SystemException {
    return new SystemException('SYSTEM_INTERNAL_INTERNAL_SERVER_ERROR', details, requestId);
  }

  // 입력 검증 관련
  static requiredFieldMissing(fieldName: string, requestId?: string): ValidationException {
    return new ValidationException('VALIDATION_INVALID_REQUIRED_FIELD_MISSING', { fieldName }, requestId);
  }

  static invalidEmailFormat(details?: Record<string, unknown>, requestId?: string): ValidationException {
    return new ValidationException('VALIDATION_INVALID_INVALID_EMAIL_FORMAT', details, requestId);
  }

  static invalidPasswordFormat(details?: Record<string, unknown>, requestId?: string): ValidationException {
    return new ValidationException('VALIDATION_INVALID_INVALID_PASSWORD_FORMAT', details, requestId);
  }

  static passwordTooShort(minLength: number, requestId?: string): ValidationException {
    return new ValidationException('VALIDATION_INVALID_PASSWORD_TOO_SHORT', { minLength }, requestId);
  }

  // 네트워크 관련
  static connectionFailed(details?: Record<string, unknown>, requestId?: string): NetworkException {
    return new NetworkException('NETWORK_INTERNAL_CONNECTION_FAILED', details, requestId);
  }

  static requestTimeout(details?: Record<string, unknown>, requestId?: string): NetworkException {
    return new NetworkException('NETWORK_INTERNAL_REQUEST_TIMEOUT', details, requestId);
  }

  // 요청 제한 관련
  static rateLimitExceeded(details?: Record<string, unknown>, requestId?: string): RateLimitException {
    return new RateLimitException('RATE_LIMIT_RATE_LIMIT_RATE_LIMIT_EXCEEDED', details, requestId);
  }

  static tooManyRequests(details?: Record<string, unknown>, requestId?: string): RateLimitException {
    return new RateLimitException('RATE_LIMIT_RATE_LIMIT_TOO_MANY_REQUESTS', details, requestId);
  }
}
