import { ErrorCode } from '../constants/error-codes';

/**
 * 에러 메시지 매핑
 * 각 에러코드에 대응하는 사용자 친화적인 메시지
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // ===== 인증/인가 관련 메시지 =====
  AUTH_AUTH_INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  AUTH_AUTH_TOKEN_MISSING: '인증 토큰이 필요합니다.',
  AUTH_AUTH_TOKEN_INVALID: '유효하지 않은 인증 토큰입니다.',
  AUTH_AUTH_TOKEN_EXPIRED: '인증 토큰이 만료되었습니다.',
  AUTH_AUTH_REFRESH_TOKEN_INVALID: '유효하지 않은 리프레시 토큰입니다.',
  AUTH_AUTH_REFRESH_TOKEN_EXPIRED: '리프레시 토큰이 만료되었습니다.',
  AUTH_AUTH_ACCOUNT_PENDING: '계정이 승인 대기 중입니다.',
  AUTH_AUTH_ACCOUNT_DEACTIVATED: '비활성화된 계정입니다.',
  AUTH_AUTH_ACCOUNT_LOCKED: '잠긴 계정입니다.',
  AUTH_AUTH_ACCOUNT_SUSPENDED: '정지된 계정입니다.',
  AUTH_AUTH_ACCOUNT_NOT_FOUND: '계정을 찾을 수 없습니다.',
  AUTH_AUTH_PASSWORD_INCORRECT: '비밀번호가 올바르지 않습니다.',
  AUTH_AUTH_SESSION_EXPIRED: '세션이 만료되었습니다.',
  AUTH_AUTH_LOGOUT_FAILED: '로그아웃에 실패했습니다.',
  AUTH_AUTHZ_INSUFFICIENT_PERMISSIONS: '권한이 부족합니다.',
  AUTH_AUTHZ_ROLE_REQUIRED: '역할이 필요합니다.',
  AUTH_AUTHZ_PERMISSION_DENIED: '권한이 거부되었습니다.',
  AUTH_AUTHZ_MENU_ACCESS_DENIED: '메뉴 접근이 거부되었습니다.',
  AUTH_AUTHZ_RESOURCE_ACCESS_DENIED: '리소스 접근이 거부되었습니다.',
  AUTH_AUTHZ_OPERATION_NOT_ALLOWED: '허용되지 않은 작업입니다.',

  // ===== 사용자 관리 관련 메시지 =====
  USER_NOT_FOUND_USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  USER_NOT_FOUND_USER_INACTIVE: '비활성 사용자입니다.',
  USER_CONFLICT_USER_ALREADY_EXISTS: '이미 존재하는 사용자입니다.',
  USER_CONFLICT_USER_EMAIL_DUPLICATE: '이미 사용 중인 이메일입니다.',
  USER_CONFLICT_USER_USERNAME_DUPLICATE: '이미 사용 중인 사용자명입니다.',
  USER_CONFLICT_USER_ALREADY_APPROVED: '이미 승인된 사용자입니다.',
  USER_CONFLICT_USER_ALREADY_REJECTED: '이미 거부된 사용자입니다.',
  USER_CONFLICT_USER_ALREADY_SUSPENDED: '이미 정지된 사용자입니다.',
  USER_CONFLICT_USER_ALREADY_ACTIVE: '이미 활성화된 사용자입니다.',
  USER_CONFLICT_USER_ALREADY_INACTIVE: '이미 비활성화된 사용자입니다.',
  USER_INVALID_USER_CREATE_FAILED: '사용자 생성에 실패했습니다.',
  USER_INVALID_USER_UPDATE_FAILED: '사용자 정보 수정에 실패했습니다.',
  USER_INVALID_USER_DELETE_FAILED: '사용자 삭제에 실패했습니다.',
  USER_INVALID_USER_PASSWORD_RESET_FAILED: '비밀번호 재설정에 실패했습니다.',
  USER_INVALID_USER_PROFILE_UPDATE_FAILED: '프로필 수정에 실패했습니다.',
  USER_INVALID_USER_APPROVAL_FAILED: '사용자 승인에 실패했습니다.',
  USER_INVALID_USER_REJECTION_FAILED: '사용자 거부에 실패했습니다.',
  USER_INVALID_USER_SUSPENSION_FAILED: '사용자 정지에 실패했습니다.',
  USER_INVALID_USER_ACTIVATION_FAILED: '사용자 활성화에 실패했습니다.',
  USER_INVALID_USER_BULK_ACTION_FAILED: '대량 작업에 실패했습니다.',
  USER_INVALID_USER_BULK_UPDATE_FAILED: '대량 수정에 실패했습니다.',
  USER_INVALID_USER_BULK_DELETE_FAILED: '대량 삭제에 실패했습니다.',

  // ===== 권한 관리 관련 메시지 =====
  PERMISSION_NOT_FOUND_PERMISSION_NOT_FOUND: '권한을 찾을 수 없습니다.',
  PERMISSION_AUTHZ_PERMISSION_DENIED: '권한이 거부되었습니다.',
  PERMISSION_AUTHZ_PERMISSION_INSUFFICIENT: '권한이 부족합니다.',
  PERMISSION_NOT_FOUND_ROLE_NOT_FOUND: '역할을 찾을 수 없습니다.',
  PERMISSION_CONFLICT_ROLE_ALREADY_EXISTS: '이미 존재하는 역할입니다.',
  PERMISSION_INVALID_ROLE_CREATE_FAILED: '역할 생성에 실패했습니다.',
  PERMISSION_INVALID_ROLE_UPDATE_FAILED: '역할 수정에 실패했습니다.',
  PERMISSION_INVALID_ROLE_DELETE_FAILED: '역할 삭제에 실패했습니다.',
  PERMISSION_INVALID_ROLE_ASSIGN_FAILED: '역할 할당에 실패했습니다.',
  PERMISSION_INVALID_ROLE_REVOKE_FAILED: '역할 회수에 실패했습니다.',
  PERMISSION_INVALID_PERMISSION_ASSIGN_FAILED: '권한 할당에 실패했습니다.',
  PERMISSION_INVALID_PERMISSION_REVOKE_FAILED: '권한 회수에 실패했습니다.',
  PERMISSION_INVALID_PERMISSION_GRANT_FAILED: '권한 부여에 실패했습니다.',
  PERMISSION_INVALID_PERMISSION_DENY_FAILED: '권한 거부에 실패했습니다.',
  PERMISSION_INVALID_PERMISSION_VALIDATION_FAILED: '권한 검증에 실패했습니다.',
  PERMISSION_INVALID_PERMISSION_CHECK_FAILED: '권한 확인에 실패했습니다.',
  PERMISSION_INVALID_PERMISSION_VERIFY_FAILED: '권한 인증에 실패했습니다.',

  // ===== 지갑/거래 관련 메시지 =====
  WALLET_NOT_FOUND_WALLET_NOT_FOUND: '지갑을 찾을 수 없습니다.',
  WALLET_NOT_FOUND_WALLET_INACTIVE: '비활성 지갑입니다.',
  WALLET_NOT_FOUND_WALLET_SUSPENDED: '정지된 지갑입니다.',
  WALLET_NOT_FOUND_TRANSACTION_NOT_FOUND: '거래를 찾을 수 없습니다.',
  WALLET_INVALID_TRANSACTION_INVALID: '유효하지 않은 거래입니다.',
  WALLET_INVALID_TRANSACTION_FAILED: '거래에 실패했습니다.',
  WALLET_CONFLICT_TRANSACTION_PENDING: '처리 중인 거래입니다.',
  WALLET_CONFLICT_TRANSACTION_COMPLETED: '완료된 거래입니다.',
  WALLET_CONFLICT_TRANSACTION_CANCELLED: '취소된 거래입니다.',
  WALLET_INVALID_INSUFFICIENT_BALANCE: '잔액이 부족합니다.',
  WALLET_LOCKED_BALANCE_LOCKED: '잔액이 잠겨있습니다.',
  WALLET_LOCKED_BALANCE_FROZEN: '잔액이 동결되었습니다.',
  WALLET_INVALID_DEPOSIT_FAILED: '입금에 실패했습니다.',
  WALLET_INVALID_WITHDRAWAL_FAILED: '출금에 실패했습니다.',
  WALLET_INVALID_TRANSFER_FAILED: '송금에 실패했습니다.',
  WALLET_INVALID_EXCHANGE_FAILED: '환전에 실패했습니다.',

  // ===== 고객 지원 관련 메시지 =====
  CUSTOMER_NOT_FOUND_INQUIRY_NOT_FOUND: '문의를 찾을 수 없습니다.',
  CUSTOMER_NOT_FOUND_TICKET_NOT_FOUND: '티켓을 찾을 수 없습니다.',
  CUSTOMER_NOT_FOUND_SUPPORT_NOT_FOUND: '지원 요청을 찾을 수 없습니다.',
  CUSTOMER_INVALID_INQUIRY_CREATE_FAILED: '문의 생성에 실패했습니다.',
  CUSTOMER_INVALID_INQUIRY_UPDATE_FAILED: '문의 수정에 실패했습니다.',
  CUSTOMER_INVALID_INQUIRY_DELETE_FAILED: '문의 삭제에 실패했습니다.',
  CUSTOMER_INVALID_TICKET_CREATE_FAILED: '티켓 생성에 실패했습니다.',
  CUSTOMER_INVALID_TICKET_UPDATE_FAILED: '티켓 수정에 실패했습니다.',
  CUSTOMER_INVALID_TICKET_CLOSE_FAILED: '티켓 닫기에 실패했습니다.',
  CUSTOMER_INVALID_REPLY_CREATE_FAILED: '답변 생성에 실패했습니다.',
  CUSTOMER_INVALID_REPLY_UPDATE_FAILED: '답변 수정에 실패했습니다.',
  CUSTOMER_INVALID_REPLY_DELETE_FAILED: '답변 삭제에 실패했습니다.',
  CUSTOMER_CONFLICT_INQUIRY_ALREADY_CLOSED: '이미 닫힌 문의입니다.',
  CUSTOMER_CONFLICT_TICKET_ALREADY_CLOSED: '이미 닫힌 티켓입니다.',
  CUSTOMER_CONFLICT_INQUIRY_ALREADY_ASSIGNED: '이미 할당된 문의입니다.',
  CUSTOMER_CONFLICT_TICKET_ALREADY_ASSIGNED: '이미 할당된 티켓입니다.',

  // ===== 시스템 관련 메시지 =====
  SYSTEM_INTERNAL_DATABASE_CONNECTION_FAILED: '데이터베이스 연결에 실패했습니다.',
  SYSTEM_INTERNAL_DATABASE_QUERY_FAILED: '데이터베이스 쿼리에 실패했습니다.',
  SYSTEM_INTERNAL_DATABASE_TRANSACTION_FAILED: '데이터베이스 트랜잭션에 실패했습니다.',
  SYSTEM_INTERNAL_DATABASE_CONSTRAINT_VIOLATION: '데이터베이스 제약 조건 위반입니다.',
  SYSTEM_INTERNAL_CACHE_CONNECTION_FAILED: '캐시 연결에 실패했습니다.',
  SYSTEM_INTERNAL_CACHE_GET_FAILED: '캐시 조회에 실패했습니다.',
  SYSTEM_INTERNAL_CACHE_SET_FAILED: '캐시 저장에 실패했습니다.',
  SYSTEM_INTERNAL_CACHE_DELETE_FAILED: '캐시 삭제에 실패했습니다.',
  SYSTEM_INTERNAL_EXTERNAL_SERVICE_UNAVAILABLE: '외부 서비스를 사용할 수 없습니다.',
  SYSTEM_INTERNAL_EXTERNAL_API_FAILED: '외부 API 호출에 실패했습니다.',
  SYSTEM_INTERNAL_EXTERNAL_TIMEOUT: '외부 서비스 응답 시간이 초과되었습니다.',
  SYSTEM_INTERNAL_FILE_UPLOAD_FAILED: '파일 업로드에 실패했습니다.',
  SYSTEM_INTERNAL_FILE_DOWNLOAD_FAILED: '파일 다운로드에 실패했습니다.',
  SYSTEM_INTERNAL_FILE_DELETE_FAILED: '파일 삭제에 실패했습니다.',
  SYSTEM_NOT_FOUND_FILE_NOT_FOUND: '파일을 찾을 수 없습니다.',
  SYSTEM_INTERNAL_CONFIG_MISSING: '설정이 누락되었습니다.',
  SYSTEM_INTERNAL_CONFIG_INVALID: '유효하지 않은 설정입니다.',
  SYSTEM_INTERNAL_ENV_VARIABLE_MISSING: '환경 변수가 누락되었습니다.',
  SYSTEM_INTERNAL_INTERNAL_SERVER_ERROR: '서버 내부 오류가 발생했습니다.',
  SYSTEM_MAINTENANCE_SERVICE_UNAVAILABLE: '서비스를 사용할 수 없습니다.',
  SYSTEM_MAINTENANCE_MAINTENANCE_MODE: '유지보수 모드입니다.',

  // ===== 입력 검증 관련 메시지 =====
  VALIDATION_INVALID_REQUIRED_FIELD_MISSING: '필수 필드가 누락되었습니다.',
  VALIDATION_INVALID_REQUIRED_EMAIL_MISSING: '이메일이 필요합니다.',
  VALIDATION_INVALID_REQUIRED_PASSWORD_MISSING: '비밀번호가 필요합니다.',
  VALIDATION_INVALID_REQUIRED_USERNAME_MISSING: '사용자명이 필요합니다.',
  VALIDATION_INVALID_INVALID_EMAIL_FORMAT: '올바른 이메일 형식이 아닙니다.',
  VALIDATION_INVALID_INVALID_PASSWORD_FORMAT: '올바른 비밀번호 형식이 아닙니다.',
  VALIDATION_INVALID_INVALID_PHONE_FORMAT: '올바른 전화번호 형식이 아닙니다.',
  VALIDATION_INVALID_INVALID_DATE_FORMAT: '올바른 날짜 형식이 아닙니다.',
  VALIDATION_INVALID_INVALID_UUID_FORMAT: '올바른 UUID 형식이 아닙니다.',
  VALIDATION_INVALID_INVALID_JSON_FORMAT: '올바른 JSON 형식이 아닙니다.',
  VALIDATION_INVALID_PASSWORD_TOO_SHORT: '비밀번호가 너무 짧습니다.',
  VALIDATION_INVALID_PASSWORD_TOO_LONG: '비밀번호가 너무 깁니다.',
  VALIDATION_INVALID_USERNAME_TOO_SHORT: '사용자명이 너무 짧습니다.',
  VALIDATION_INVALID_USERNAME_TOO_LONG: '사용자명이 너무 깁니다.',
  VALIDATION_INVALID_MESSAGE_TOO_LONG: '메시지가 너무 깁니다.',
  VALIDATION_INVALID_VALUE_OUT_OF_RANGE: '값이 허용 범위를 벗어났습니다.',
  VALIDATION_INVALID_AMOUNT_INVALID: '유효하지 않은 금액입니다.',
  VALIDATION_INVALID_PRICE_INVALID: '유효하지 않은 가격입니다.',
  VALIDATION_INVALID_QUANTITY_INVALID: '유효하지 않은 수량입니다.',
  VALIDATION_INVALID_INVALID_DATA_TYPE: '올바른 데이터 타입이 아닙니다.',
  VALIDATION_INVALID_INVALID_ENUM_VALUE: '올바른 열거형 값이 아닙니다.',
  VALIDATION_INVALID_INVALID_BOOLEAN_VALUE: '올바른 불린 값이 아닙니다.',
  VALIDATION_INVALID_INVALID_NUMBER_VALUE: '올바른 숫자 값이 아닙니다.',

  // ===== 네트워크 관련 메시지 =====
  NETWORK_INTERNAL_CONNECTION_FAILED: '연결에 실패했습니다.',
  NETWORK_INTERNAL_CONNECTION_TIMEOUT: '연결 시간이 초과되었습니다.',
  NETWORK_INTERNAL_CONNECTION_REFUSED: '연결이 거부되었습니다.',
  NETWORK_INTERNAL_REQUEST_FAILED: '요청에 실패했습니다.',
  NETWORK_INTERNAL_REQUEST_TIMEOUT: '요청 시간이 초과되었습니다.',
  NETWORK_INTERNAL_REQUEST_ABORTED: '요청이 중단되었습니다.',
  NETWORK_INTERNAL_RESPONSE_INVALID: '유효하지 않은 응답입니다.',
  NETWORK_INTERNAL_RESPONSE_TIMEOUT: '응답 시간이 초과되었습니다.',
  NETWORK_INTERNAL_RESPONSE_EMPTY: '빈 응답을 받았습니다.',
  NETWORK_INTERNAL_DNS_RESOLUTION_FAILED: 'DNS 해석에 실패했습니다.',
  NETWORK_INTERNAL_DNS_TIMEOUT: 'DNS 해석 시간이 초과되었습니다.',
  NETWORK_INTERNAL_SSL_HANDSHAKE_FAILED: 'SSL 핸드셰이크에 실패했습니다.',
  NETWORK_INTERNAL_CERTIFICATE_INVALID: '유효하지 않은 인증서입니다.',
  NETWORK_INTERNAL_CERTIFICATE_EXPIRED: '만료된 인증서입니다.',

  // ===== 요청 제한 관련 메시지 =====
  RATE_LIMIT_RATE_LIMIT_RATE_LIMIT_EXCEEDED: '요청 한도를 초과했습니다.',
  RATE_LIMIT_RATE_LIMIT_TOO_MANY_REQUESTS: '너무 많은 요청이 발생했습니다.',
  RATE_LIMIT_RATE_LIMIT_QUOTA_EXCEEDED: '할당량을 초과했습니다.',
  RATE_LIMIT_RATE_LIMIT_LOGIN_ATTEMPTS_EXCEEDED: '로그인 시도 횟수를 초과했습니다.',
  RATE_LIMIT_RATE_LIMIT_PASSWORD_RESET_EXCEEDED: '비밀번호 재설정 횟수를 초과했습니다.',
  RATE_LIMIT_RATE_LIMIT_REGISTRATION_EXCEEDED: '회원가입 횟수를 초과했습니다.',
  RATE_LIMIT_RATE_LIMIT_API_CALLS_EXCEEDED: 'API 호출 횟수를 초과했습니다.',
  RATE_LIMIT_RATE_LIMIT_HOURLY_LIMIT_EXCEEDED: '시간당 요청 한도를 초과했습니다.',
  RATE_LIMIT_RATE_LIMIT_DAILY_LIMIT_EXCEEDED: '일일 요청 한도를 초과했습니다.',
  RATE_LIMIT_RATE_LIMIT_MONTHLY_LIMIT_EXCEEDED: '월간 요청 한도를 초과했습니다.',
};

/**
 * 에러 심각도 레벨
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * 에러 카테고리
 */
export enum ErrorCategory {
  AUTH = 'auth',
  USER = 'user',
  PERMISSION = 'permission',
  WALLET = 'wallet',
  CUSTOMER = 'customer',
  SYSTEM = 'system',
  VALIDATION = 'validation',
  NETWORK = 'network',
  RATE_LIMIT = 'rate_limit',
}

/**
 * 확장된 API 에러 타입
 */
export interface ExtendedApiError {
  code: ErrorCode;
  message: string;
  status: number;
  severity: ErrorSeverity;
  category: ErrorCategory;
  details?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
  stack?: string;
}

/**
 * 에러 응답 타입
 */
export interface ErrorResponse {
  success: false;
  error: ExtendedApiError;
  data: null;
  timestamp: string;
}

/**
 * 에러 매핑 함수
 */
export function getErrorMessage(errorCode: ErrorCode): string {
  return ERROR_MESSAGES[errorCode] || '알 수 없는 오류가 발생했습니다.';
}

/**
 * 에러 심각도 매핑
 */
export function getErrorSeverity(errorCode: ErrorCode): ErrorSeverity {
  if (errorCode.startsWith('SYSTEM_INTERNAL_') || errorCode.startsWith('NETWORK_INTERNAL_')) {
    return ErrorSeverity.CRITICAL;
  }
  if (errorCode.includes('_AUTH_') || errorCode.includes('_AUTHZ_')) {
    return ErrorSeverity.HIGH;
  }
  if (errorCode.includes('_CONFLICT_') || errorCode.includes('_INVALID_')) {
    return ErrorSeverity.MEDIUM;
  }
  return ErrorSeverity.LOW;
}

/**
 * 에러 카테고리 매핑
 */
export function getErrorCategory(errorCode: ErrorCode): ErrorCategory {
  if (errorCode.startsWith('AUTH_')) return ErrorCategory.AUTH;
  if (errorCode.startsWith('USER_')) return ErrorCategory.USER;
  if (errorCode.startsWith('PERMISSION_')) return ErrorCategory.PERMISSION;
  if (errorCode.startsWith('WALLET_')) return ErrorCategory.WALLET;
  if (errorCode.startsWith('CUSTOMER_')) return ErrorCategory.CUSTOMER;
  if (errorCode.startsWith('SYSTEM_')) return ErrorCategory.SYSTEM;
  if (errorCode.startsWith('VALIDATION_')) return ErrorCategory.VALIDATION;
  if (errorCode.startsWith('NETWORK_')) return ErrorCategory.NETWORK;
  if (errorCode.startsWith('RATE_LIMIT_')) return ErrorCategory.RATE_LIMIT;
  return ErrorCategory.SYSTEM;
}

/**
 * HTTP 상태 코드 매핑
 */
export function getHttpStatusFromErrorCode(errorCode: ErrorCode): number {
  if (errorCode.includes('_NOT_FOUND_')) return 404;
  if (errorCode.includes('_CONFLICT_')) return 409;
  if (errorCode.includes('_AUTH_') && !errorCode.includes('_AUTHZ_')) return 401;
  if (errorCode.includes('_AUTHZ_')) return 403;
  if (errorCode.includes('_INVALID_') || errorCode.includes('_VALIDATION_')) return 400;
  if (errorCode.includes('_RATE_LIMIT_')) return 429;
  if (errorCode.includes('_MAINTENANCE_')) return 503;
  if (errorCode.includes('_INTERNAL_')) return 500;
  return 500;
}
