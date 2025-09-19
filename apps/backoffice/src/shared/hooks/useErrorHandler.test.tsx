import { renderHook, act } from '@testing-library/react';
import { message } from 'antd';
import { useErrorHandler } from './useErrorHandler';
import { AxiosError } from 'axios';

// Mock antd message
jest.mock('antd', () => ({
  message: {
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleError', () => {
    it('should handle 401 error and redirect to login', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error: AxiosError = {
        response: {
          data: { message: 'Unauthorized' },
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config: {},
        },
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed with status code 401',
        config: {},
        code: 'ERR_BAD_REQUEST',
        request: {},
      };

      act(() => {
        result.current.handleError(error);
      });

      expect(message.error).toHaveBeenCalledWith('인증이 필요합니다. 다시 로그인해주세요.');
      expect(window.location.href).toBe('/login');
    });

    it('should handle 403 error', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error: AxiosError = {
        response: {
          data: { message: 'Forbidden' },
          status: 403,
          statusText: 'Forbidden',
          headers: {},
          config: {},
        },
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed with status code 403',
        config: {},
        code: 'ERR_BAD_REQUEST',
        request: {},
      };

      act(() => {
        result.current.handleError(error);
      });

      expect(message.error).toHaveBeenCalledWith('접근 권한이 없습니다.');
    });

    it('should handle 409 error with warning', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error: AxiosError = {
        response: {
          data: { message: 'Conflict' },
          status: 409,
          statusText: 'Conflict',
          headers: {},
          config: {},
        },
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed with status code 409',
        config: {},
        code: 'ERR_BAD_REQUEST',
        request: {},
      };

      act(() => {
        result.current.handleError(error);
      });

      expect(message.warning).toHaveBeenCalledWith('잘못된 요청입니다.');
    });

    it('should handle 5xx error', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error: AxiosError = {
        response: {
          data: { message: 'Internal Server Error' },
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config: {},
        },
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed with status code 500',
        config: {},
        code: 'ERR_BAD_REQUEST',
        request: {},
      };

      act(() => {
        result.current.handleError(error);
      });

      expect(message.error).toHaveBeenCalledWith('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    });

    it('should handle generic error', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Generic error');

      act(() => {
        result.current.handleError(error);
      });

      expect(message.error).toHaveBeenCalledWith('Generic error');
    });

    it('should use custom message when provided', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Original error');

      act(() => {
        result.current.handleError(error, 'Custom error message');
      });

      expect(message.error).toHaveBeenCalledWith('Custom error message');
    });
  });

  describe('handleAsyncError', () => {
    it('should return result when async function succeeds', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const asyncFn = jest.fn().mockResolvedValue('success');

      const asyncResult = await act(async () => {
        return await result.current.handleAsyncError(asyncFn);
      });

      expect(asyncResult).toBe('success');
      expect(asyncFn).toHaveBeenCalled();
    });

    it('should return null and handle error when async function fails', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const asyncFn = jest.fn().mockRejectedValue(new Error('Async error'));

      const asyncResult = await act(async () => {
        return await result.current.handleAsyncError(asyncFn);
      });

      expect(asyncResult).toBeNull();
      expect(message.error).toHaveBeenCalledWith('Async error');
    });

    it('should use custom message when provided', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const asyncFn = jest.fn().mockRejectedValue(new Error('Async error'));

      await act(async () => {
        return await result.current.handleAsyncError(asyncFn, 'Custom async error');
      });

      expect(message.error).toHaveBeenCalledWith('Custom async error');
    });
  });
});
