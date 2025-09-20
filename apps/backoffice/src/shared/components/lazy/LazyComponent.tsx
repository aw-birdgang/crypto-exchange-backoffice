import React, { Suspense, ComponentType } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface LazyComponentProps {
  fallback?: React.ReactNode;
}

// 동적 import를 위한 고차 컴포넌트
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyComponent(props: P & LazyComponentProps) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// 페이지 컴포넌트를 위한 특별한 래퍼
export function LazyPage({ children, fallback }: LazyComponentProps & { children: React.ReactNode }) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      {children}
    </Suspense>
  );
}
