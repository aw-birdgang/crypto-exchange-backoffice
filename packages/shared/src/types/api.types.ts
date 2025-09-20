// API 관련 공통 타입 정의

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
  timestamp?: string;
  error?: string;
}

export interface QueryError extends Error {
  status?: number;
  response?: {
    status: number;
    data?: ApiError;
  };
  code?: string;
}

export interface MutationError extends Error {
  status?: number;
  response?: {
    status: number;
    data?: ApiError;
  };
  code?: string;
}

// HTTP 상태 코드 타입
export type HttpStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 422 | 429 | 500 | 502 | 503 | 504;

// 에러 타입 가드 함수들
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error &&
    typeof (error as ApiError).message === 'string' &&
    typeof (error as ApiError).status === 'number'
  );
}

export function isQueryError(error: unknown): error is QueryError {
  return (
    error instanceof Error &&
    ('status' in error || 'response' in error || 'code' in error)
  );
}

export function isMutationError(error: unknown): error is MutationError {
  return (
    error instanceof Error &&
    ('status' in error || 'response' in error || 'code' in error)
  );
}
