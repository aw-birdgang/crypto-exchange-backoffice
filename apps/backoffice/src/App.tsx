import {Navigate, Route, Routes} from 'react-router-dom';
import {useEffect, lazy, useState} from 'react';
import {App as AntdApp} from 'antd';
import {useAuthStore} from './features/auth/application/stores/auth.store';
import {usePermissionStore} from './features/auth/application/stores/permission.store';
import {LoginPage} from './features/auth/presentation/pages/LoginPage';
import {AppLayout} from './shared/components/layout/AppLayout';
import {LoadingSpinner} from './shared/components/common/LoadingSpinner';
import {LazyPage} from './shared/components/lazy/LazyComponent';
import {ROUTES} from '@crypto-exchange/shared';

// 동적 import를 사용한 코드 스플리팅
const PermissionManagementPage = lazy(() => import('./features/auth/presentation/pages/PermissionManagementPage').then(m => ({ default: m.PermissionManagementPage })));
const AdminUserManagementPage = lazy(() => import('./features/users/presentation/pages/AdminUserManagementPage').then(m => ({ default: m.AdminUserManagementPage })));
const WalletTransactionsPage = lazy(() => import('./features/wallet/presentation/pages/WalletTransactionsPage').then(m => ({ default: m.WalletTransactionsPage })));
const CustomerSupportPage = lazy(() => import('./features/customer/presentation/pages/CustomerSupportPage').then(m => ({ default: m.CustomerSupportPage })));

function AppComponent() {
  const { isAuthenticated, isLoading, user, accessToken } = useAuthStore();
  const { permissionsLoading } = usePermissionStore();
  const [isAppReady, setIsAppReady] = useState(false);

  // 초기 로딩 상태 확인
  useEffect(() => {
    // 토큰이 없으면 로딩 상태를 false로 설정
    if (!accessToken && !user) {
      useAuthStore.getState().setLoading(false);
    }
  }, [accessToken, user]);

  // 앱 준비 상태 설정
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 200); // 앱 초기화 완료 후 레이아웃 안정화

    return () => clearTimeout(timer);
  }, []);

  // 로딩 중이면 스피너 표시 (인증 로딩 또는 권한 로딩)
  if (isLoading || (isAuthenticated && permissionsLoading)) {
    return <LoadingSpinner />;
  }

  // 인증되지 않았으면 로그인 페이지 표시
  if (!isAuthenticated || !user || !accessToken) {
    return <LoginPage />;
  }

  // 인증된 사용자는 메인 레이아웃 표시
  return (
    <div className={`app-container ${isAppReady ? 'app-ready' : 'app-loading'}`}>
      <AppLayout>
        <Routes>
        <Route path="/" element={<Navigate to={ROUTES.WALLET.TRANSACTIONS} replace />} />

        {/* 지갑관리 라우트 */}
        <Route 
          path={ROUTES.WALLET.TRANSACTIONS} 
          element={
            <LazyPage>
              <WalletTransactionsPage />
            </LazyPage>
          } 
        />

        {/* 고객관리 라우트 (일반 사용자 관리) */}
        <Route 
          path={ROUTES.CUSTOMER.SUPPORT} 
          element={
            <LazyPage>
              <CustomerSupportPage />
            </LazyPage>
          } 
        />

        {/* 어드민 계정 관리 라우트 (AdminUser 관리) */}
        <Route 
          path={ROUTES.ADMIN.USERS} 
          element={
            <LazyPage>
              <AdminUserManagementPage />
            </LazyPage>
          } 
        />
        <Route 
          path={ROUTES.ADMIN.PERMISSIONS} 
          element={
            <LazyPage>
              <PermissionManagementPage />
            </LazyPage>
          } 
        />

        {/* 기존 라우트 (호환성을 위해 유지) */}
        <Route 
          path={ROUTES.PERMISSIONS} 
          element={
            <LazyPage>
              <PermissionManagementPage />
            </LazyPage>
          } 
        />
        <Route 
          path={ROUTES.USERS} 
          element={
            <LazyPage>
              <AdminUserManagementPage />
            </LazyPage>
          } 
        />

        <Route path="*" element={<Navigate to={ROUTES.WALLET.TRANSACTIONS} replace />} />
        </Routes>
      </AppLayout>
    </div>
  );
}

function App() {
  return (
    <AntdApp>
      <AppComponent />
    </AntdApp>
  );
}

export default App;
