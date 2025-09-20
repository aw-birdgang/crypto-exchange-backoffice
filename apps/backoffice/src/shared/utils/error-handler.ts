import { AxiosError } from 'axios';
import { ApiResponse, ExtendedApiError, ErrorResponse } from '@crypto-exchange/shared';

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
  severity?: string;
  category?: string;
  timestamp?: string;
  requestId?: string;
}

export class ErrorHandler {
  static handleApiError(error: AxiosError): AppError {
    if (error.response) {
      // 서버에서 응답을 받았지만 에러 상태 코드
      const response = error.response.data as ErrorResponse;
      
      if (response.error) {
        // 새로운 에러코드 시스템 사용
        return {
          message: response.error.message,
          code: response.error.code,
          status: response.error.status,
          severity: response.error.severity,
          category: response.error.category,
          details: response.error.details,
          timestamp: response.error.timestamp,
          requestId: response.error.requestId,
        };
      } else {
        // 기존 ApiResponse 형식
        const legacyResponse = response as unknown as ApiResponse<any>;
        return {
          message: legacyResponse.message || 'API Error',
          code: 'API_ERROR',
          status: error.response.status,
          details: legacyResponse.data,
        };
      }
    } else if (error.request) {
      // 요청이 전송되었지만 응답을 받지 못함
      return {
        message: '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.',
        code: 'NETWORK_INTERNAL_CONNECTION_FAILED',
        status: 0,
        severity: 'high',
        category: 'network',
      };
    } else {
      // 요청 설정 중에 에러 발생
      return {
        message: error.message || '알 수 없는 오류가 발생했습니다.',
        code: 'NETWORK_INTERNAL_REQUEST_FAILED',
        severity: 'medium',
        category: 'network',
      };
    }
  }

  static handleGenericError(error: unknown): AppError {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'SYSTEM_INTERNAL_INTERNAL_SERVER_ERROR',
        severity: 'medium',
        category: 'system',
      };
    }

    return {
      message: '알 수 없는 오류가 발생했습니다.',
      code: 'SYSTEM_INTERNAL_INTERNAL_SERVER_ERROR',
      severity: 'high',
      category: 'system',
    };
  }

  static getErrorMessage(error: AppError): string {
    const statusMessages: Record<number, string> = {
      400: '잘못된 요청입니다.',
      401: '인증이 필요합니다.',
      403: '접근 권한이 없습니다.',
      404: '요청한 리소스를 찾을 수 없습니다.',
      409: '이미 존재하는 데이터입니다.',
      422: '입력 데이터가 올바르지 않습니다.',
      500: '서버 내부 오류가 발생했습니다.',
      502: '게이트웨이 오류가 발생했습니다.',
      503: '서비스를 사용할 수 없습니다.',
    };

    if (error.status && statusMessages[error.status]) {
      return statusMessages[error.status];
    }

    return error.message;
  }

  static shouldRetry(error: AppError): boolean {
    // 네트워크 에러나 5xx 에러는 재시도 가능
    if (error.code?.startsWith('NETWORK_') || error.code === 'NETWORK_ERROR') {
      return true;
    }

    if (error.severity === 'critical' || error.severity === 'high') {
      return true;
    }

    if (error.status && error.status >= 500) {
      return true;
    }

    return false;
  }
}
