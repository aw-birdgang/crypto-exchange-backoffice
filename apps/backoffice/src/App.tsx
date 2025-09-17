import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './features/auth/application/stores/auth.store';
import { LoginPage } from './features/auth/presentation/pages/LoginPage';
import { PermissionManagementPage } from './features/auth/presentation/pages/PermissionManagementPage';
import { DashboardPage } from './features/dashboard/presentation/pages/DashboardPage';
import { UsersPage } from './features/users/presentation/pages/UsersPage';
import { OrdersPage } from './features/orders/presentation/pages/OrdersPage';
import { MarketsPage } from './features/markets/presentation/pages/MarketsPage';
import { WalletsPage } from './features/wallets/presentation/pages/WalletsPage';
import { AppLayout } from './shared/components/layout/AppLayout';
import { LoadingSpinner } from './shared/components/common/LoadingSpinner';
import { ROUTES } from '@crypto-exchange/shared';

function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.USERS} element={<UsersPage />} />
        <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
        <Route path={ROUTES.MARKETS} element={<MarketsPage />} />
        <Route path={ROUTES.WALLETS} element={<WalletsPage />} />
        <Route path={ROUTES.REPORTS} element={<div>리포트 페이지 (구현 예정)</div>} />
        <Route path={ROUTES.SETTINGS} element={<div>설정 페이지 (구현 예정)</div>} />
        <Route path={ROUTES.PERMISSIONS} element={<PermissionManagementPage />} />
        <Route path={ROUTES.AUDIT_LOGS} element={<div>감사 로그 페이지 (구현 예정)</div>} />
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
