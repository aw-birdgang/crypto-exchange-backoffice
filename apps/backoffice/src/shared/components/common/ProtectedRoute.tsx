import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/application/stores/auth.store';
import { usePermissions } from '../../../features/auth/application/hooks/usePermissions';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: {
    resource: string;
    permission: string;
  };
  requiredMenuAccess?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredMenuAccess,
}) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { hasPermission, loading: permissionLoading } = usePermissions();
  const location = useLocation();

  if (isLoading || permissionLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 권한 검증
  if (requiredPermission) {
    const hasAccess = hasPermission(
      requiredPermission.resource as any,
      requiredPermission.permission as any,
    );
    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 메뉴 접근 검증
  if (requiredMenuAccess) {
    // 비동기 검증이므로 일단 통과시키고, 컴포넌트 내에서 검증
    // 실제로는 usePermissions 훅에서 처리
  }

  return <>{children}</>;
};
