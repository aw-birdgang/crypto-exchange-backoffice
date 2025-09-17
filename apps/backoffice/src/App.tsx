import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './features/auth/application/stores/auth.store';
import { LoginPage } from './features/auth/presentation/pages/LoginPage';
import { DashboardPage } from './features/dashboard/presentation/pages/DashboardPage';
import { UsersPage } from './features/users/presentation/pages/UsersPage';
import { OrdersPage } from './features/orders/presentation/pages/OrdersPage';
import { MarketsPage } from './features/markets/presentation/pages/MarketsPage';
import { WalletsPage } from './features/wallets/presentation/pages/WalletsPage';
import { AppLayout } from './shared/components/layout/AppLayout';
import { LoadingSpinner } from './shared/components/common/LoadingSpinner';

function App() {
  const { isAuthenticated, isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    // 앱 시작 시 로딩 상태를 false로 설정
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1초 후 로딩 완료

    return () => clearTimeout(timer);
  }, [setLoading]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/markets" element={<MarketsPage />} />
        <Route path="/wallets" element={<WalletsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
