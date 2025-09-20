import React from 'react';
import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useErrorHandler } from './useErrorHandler';
import { MutationError, isMutationError } from '@crypto-exchange/shared';

interface OptimizedMutationOptions<TData, TError = MutationError, TVariables = unknown> 
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'onError'> {
  errorMessage?: string;
  successMessage?: string;
}

export function useOptimizedMutation<TData = unknown, TError = MutationError, TVariables = unknown>(
  options: OptimizedMutationOptions<TData, TError, TVariables>,
): UseMutationResult<TData, TError, TVariables> {
  const { handleError } = useErrorHandler();

  const mutation = useMutation({
    ...options,
  });

  // 성공 메시지 처리를 위한 useEffect
  React.useEffect(() => {
    if (mutation.isSuccess && options.successMessage) {
      import('antd').then(({ message }) => {
        message.success(options.successMessage);
      });
    }
  }, [mutation.isSuccess, options.successMessage]);

  return mutation;
}