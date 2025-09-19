import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './features/auth/application/stores/auth.store';
import { usePermissionStore } from './features/auth/application/stores/permission.store';
import { LoginPage } from './features/auth/presentation/pages/LoginPage';
import { PermissionManagementPage } from './features/auth/presentation/pages/PermissionManagementPage';
import { DashboardPage } from './features/dashboard/presentation/pages/DashboardPage';
import { AppLayout } from './shared/components/layout/AppLayout';
import { LoadingSpinner } from './shared/components/common/LoadingSpinner';
import { ROUTES } from '@crypto-exchange/shared';

function App() {
  const { isAuthenticated, isLoading, user, accessToken } = useAuthStore();
  const { permissionsLoading } = usePermissionStore();

  // 초기 로딩 상태 확인
  useEffect(() => {
    // 토큰이 없으면 로딩 상태를 false로 설정
    if (!accessToken && !user) {
      useAuthStore.getState().setLoading(false);
    }
  }, [accessToken, user]);

  // 로딩 중이면 스피너 표시 (인증 로딩 또는 권한 로딩)
  if (isLoading || (isAuthenticated && permissionsLoading)) {
    return <LoadingSpinner />;
  }

  // 인증되지 않았으면 로그인 페이지 표시
  if (!isAuthenticated || !user || !accessToken) {
    console.log('🔒 User not authenticated, showing login page');
    return <LoginPage />;
  }

  // 인증된 사용자는 메인 레이아웃 표시
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.PERMISSIONS} element={<PermissionManagementPage />} />
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
