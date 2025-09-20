import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useErrorHandler } from './useErrorHandler';
import { QueryError, isQueryError } from '@crypto-exchange/shared';

interface OptimizedQueryOptions<TData, TError = QueryError> extends Omit<UseQueryOptions<TData, TError>, 'onError'> {
  errorMessage?: string;
  retry?: boolean;
}

export function useOptimizedQuery<TData = unknown, TError = QueryError>(
  options: OptimizedQueryOptions<TData, TError>,
): UseQueryResult<TData, TError> {
  const { handleError } = useErrorHandler();

  return useQuery({
    ...options,
    retry: (failureCount, error: TError) => {
      // 401 에러는 재시도하지 않음
      if (isQueryError(error) && error.status === 401) {
        return false;
      }
      
      // 사용자 정의 retry 로직
      if (typeof options.retry === 'boolean') {
        return options.retry && failureCount < 3;
      }
      
      // 기본 재시도 로직
      return failureCount < 3;
    },
    // 성능 최적화를 위한 기본 설정
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
}
