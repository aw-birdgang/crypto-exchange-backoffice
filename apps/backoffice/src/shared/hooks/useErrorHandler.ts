import { useCallback } from 'react';
import { message } from 'antd';
import { AxiosError } from 'axios';
import { ErrorHandler, AppError } from '../utils/error-handler';

export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    let appError: AppError;

    if (error instanceof AxiosError) {
      appError = ErrorHandler.handleApiError(error);
    } else {
      appError = ErrorHandler.handleGenericError(error);
    }

    const errorMessage = customMessage || ErrorHandler.getErrorMessage(appError);

    // 에러 타입에 따른 메시지 표시
    if (appError.status === 401) {
      message.error('인증이 필요합니다. 다시 로그인해주세요.');
      // 로그아웃 처리
      window.location.href = '/login';
      return;
    }

    if (appError.status === 403) {
      message.error('접근 권한이 없습니다.');
      return;
    }

    if (appError.status === 409) {
      message.warning(errorMessage);
      return;
    }

    if (appError.status && appError.status >= 500) {
      message.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    // 일반적인 에러 메시지 표시
    message.error(errorMessage);
  }, []);

  const handleAsyncError = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      customMessage?: string,
    ): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        handleError(error, customMessage);
        return null;
      }
    },
    [handleError],
  );

  return {
    handleError,
    handleAsyncError,
  };
};
