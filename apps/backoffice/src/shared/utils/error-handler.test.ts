import { AxiosError } from 'axios';
import { ErrorHandler, AppError } from './error-handler';

describe('ErrorHandler', () => {
  describe('handleApiError', () => {
    it('should handle API response error', () => {
      const mockError: AxiosError = {
        response: {
          data: {
            success: false,
            message: 'API Error',
            error: 'VALIDATION_ERROR',
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {},
        },
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed with status code 400',
        config: {},
        code: 'ERR_BAD_REQUEST',
        request: {},
      };

      const result = ErrorHandler.handleApiError(mockError);

      expect(result).toEqual({
        message: 'API Error',
        code: 'VALIDATION_ERROR',
        status: 400,
        details: 'VALIDATION_ERROR',
      });
    });

    it('should handle network error', () => {
      const mockError: AxiosError = {
        request: {},
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Network Error',
        config: {},
        code: 'ERR_NETWORK',
      };

      const result = ErrorHandler.handleApiError(mockError);

      expect(result).toEqual({
        message: '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.',
        code: 'NETWORK_ERROR',
        status: 0,
      });
    });

    it('should handle request configuration error', () => {
      const mockError: AxiosError = {
        message: 'Request configuration error',
        isAxiosError: true,
        name: 'AxiosError',
        config: {},
        code: 'ERR_BAD_REQUEST',
      };

      const result = ErrorHandler.handleApiError(mockError);

      expect(result).toEqual({
        message: 'Request configuration error',
        code: 'REQUEST_ERROR',
      });
    });
  });

  describe('handleGenericError', () => {
    it('should handle Error instance', () => {
      const error = new Error('Generic error');

      const result = ErrorHandler.handleGenericError(error);

      expect(result).toEqual({
        message: 'Generic error',
        code: 'GENERIC_ERROR',
      });
    });

    it('should handle unknown error', () => {
      const error = 'String error';

      const result = ErrorHandler.handleGenericError(error);

      expect(result).toEqual({
        message: '알 수 없는 오류가 발생했습니다.',
        code: 'UNKNOWN_ERROR',
      });
    });
  });

  describe('getErrorMessage', () => {
    it('should return status-specific message for known status codes', () => {
      const error: AppError = {
        message: 'Original message',
        status: 401,
      };

      const result = ErrorHandler.getErrorMessage(error);

      expect(result).toBe('인증이 필요합니다.');
    });

    it('should return original message for unknown status codes', () => {
      const error: AppError = {
        message: 'Custom error message',
        status: 999,
      };

      const result = ErrorHandler.getErrorMessage(error);

      expect(result).toBe('Custom error message');
    });
  });

  describe('shouldRetry', () => {
    it('should return true for network errors', () => {
      const error: AppError = {
        message: 'Network error',
        code: 'NETWORK_ERROR',
      };

      const result = ErrorHandler.shouldRetry(error);

      expect(result).toBe(true);
    });

    it('should return true for 5xx errors', () => {
      const error: AppError = {
        message: 'Server error',
        status: 500,
      };

      const result = ErrorHandler.shouldRetry(error);

      expect(result).toBe(true);
    });

    it('should return false for 4xx errors', () => {
      const error: AppError = {
        message: 'Client error',
        status: 400,
      };

      const result = ErrorHandler.shouldRetry(error);

      expect(result).toBe(false);
    });
  });
});
