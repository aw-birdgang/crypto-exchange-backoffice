import {Navigate, Route, Routes} from 'react-router-dom';
import {useEffect} from 'react';
import {useAuthStore} from './features/auth/application/stores/auth.store';
import {usePermissionStore} from './features/auth/application/stores/permission.store';
import {LoginPage} from './features/auth/presentation/pages/LoginPage';
import {PermissionManagementPage} from './features/auth/presentation/pages/PermissionManagementPage';
import {DashboardPage} from './features/dashboard/presentation/pages/DashboardPage';
import {AdminUserManagementPage} from './features/users/presentation/pages/AdminUserManagementPage';
import {WalletTransactionsPage} from './features/wallet/presentation/pages/WalletTransactionsPage';
import {CustomerSupportPage} from './features/customer/presentation/pages/CustomerSupportPage';
import {AppLayout} from './shared/components/layout/AppLayout';
import {LoadingSpinner} from './shared/components/common/LoadingSpinner';
import {ROUTES} from '@crypto-exchange/shared';

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
        <Route path="/" element={<Navigate to={ROUTES.WALLET.TRANSACTIONS} replace />} />

        {/* 지갑관리 라우트 */}
        <Route path={ROUTES.WALLET.TRANSACTIONS} element={<WalletTransactionsPage />} />

        {/* 고객관리 라우트 (일반 사용자 관리) */}
        <Route path={ROUTES.CUSTOMER.SUPPORT} element={<CustomerSupportPage />} />

        {/* 어드민 계정 관리 라우트 (AdminUser 관리) */}
        <Route path={ROUTES.ADMIN.USERS} element={<AdminUserManagementPage />} />
        <Route path={ROUTES.ADMIN.PERMISSIONS} element={<PermissionManagementPage />} />

        {/* 기존 라우트 (호환성을 위해 유지) */}
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.PERMISSIONS} element={<PermissionManagementPage />} />
        <Route path={ROUTES.USERS} element={<AdminUserManagementPage />} />

        <Route path="*" element={<Navigate to={ROUTES.WALLET.TRANSACTIONS} replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
