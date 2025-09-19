import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useErrorHandler } from './useErrorHandler';

interface OptimizedMutationOptions<TData, TError = unknown, TVariables = unknown> 
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'onError'> {
  errorMessage?: string;
  successMessage?: string;
}

export function useOptimizedMutation<TData = unknown, TError = unknown, TVariables = unknown>(
  options: OptimizedMutationOptions<TData, TError, TVariables>,
): UseMutationResult<TData, TError, TVariables> {
  const { handleError } = useErrorHandler();

  return useMutation({
    ...options,
    onSuccess: (data, variables, context) => {
      if (options.successMessage) {
        // 성공 메시지 표시 (antd message 사용)
        import('antd').then(({ message }) => {
          message.success(options.successMessage);
        });
      }
      (options.onSuccess as any)?.(data, variables, undefined, context);
    },
    // 성능 최적화를 위한 기본 설정
    retry: (failureCount, error: any) => {
      // 401, 403 에러는 재시도하지 않음
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      
      // 네트워크 에러나 5xx 에러는 재시도
      if (error?.status >= 500 || error?.code === 'NETWORK_ERROR') {
        return failureCount < 2;
      }
      
      return false;
    },
  });
}
