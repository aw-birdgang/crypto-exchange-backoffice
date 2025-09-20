import React, { useState, useMemo } from 'react';
import { Layout, Avatar, Dropdown, theme } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/application/stores/auth.store';
import { usePermissions } from '../../../features/auth/application/hooks/usePermissions';
import { ROUTES, AdminUserRole } from '@crypto-exchange/shared';
import { TopNavigation, MainCategory } from './TopNavigation';
import { CategorySidebar } from './CategorySidebar';

const { Header, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MainCategory>('wallet');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { hasPermission, loading: permissionsLoading, permissions } = usePermissions();
  const { token } = theme.useToken();

  // 현재 경로에 따라 활성 카테고리 결정
  const getCategoryFromPath = (pathname: string): MainCategory => {
    if (pathname.startsWith('/wallet')) return 'wallet';
    if (pathname.startsWith('/customer')) return 'customer';
    if (pathname.startsWith('/admin') || pathname.startsWith('/users') || pathname.startsWith('/permissions')) return 'admin';
    return 'admin'; // 기본값
  };

  // URL 변경 시 카테고리 업데이트
  React.useEffect(() => {
    const category = getCategoryFromPath(location.pathname);
    setActiveCategory(category);
  }, [location.pathname]);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '프로필',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '설정',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      onClick: logout,
    },
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const handleCategoryChange = (category: MainCategory) => {
    setActiveCategory(category);
    // 카테고리 변경 시 해당 카테고리의 첫 번째 메뉴로 이동
    switch (category) {
      case 'wallet':
        navigate(ROUTES.WALLET.TRANSACTIONS);
        break;
      case 'customer':
        navigate(ROUTES.CUSTOMER.SUPPORT);
        break;
      case 'admin':
        navigate(ROUTES.ADMIN.PERMISSIONS);
        break;
    }
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    const item = userMenuItems.find((item) => item.key === key);
    if (item?.onClick) {
      item.onClick();
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 상단 메인 카테고리 네비게이션 */}
      <TopNavigation
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      <Layout>
        {/* 왼쪽 사이드바 */}
        <CategorySidebar
          collapsed={collapsed}
          onCollapse={setCollapsed}
          activeCategory={activeCategory}
          selectedKeys={[location.pathname]}
          onMenuClick={handleMenuClick}
          hasPermission={hasPermission}
          permissionsLoading={permissionsLoading}
          permissions={permissions}
        />
        
        <Layout>
          {/* 상단 헤더 */}
          <Header
            style={{
              padding: '0 24px',
              background: token.colorBgContainer,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              minHeight: '64px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h2 style={{ color: token.colorPrimary, margin: 0 }}>
                Crypto Exchange
              </h2>
            </div>
            
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s',
                  minWidth: '120px',
                  maxWidth: '200px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = token.colorFillSecondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Avatar
                  style={{
                    backgroundColor: token.colorPrimary,
                    marginRight: 8,
                  }}
                >
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <div style={{ 
                  minWidth: 0,
                  flex: 1,
                  overflow: 'hidden',
                }}>
                  <div style={{ 
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '1.2',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {user ? `${user.firstName} ${user.lastName}` : '사용자'}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: token.colorTextSecondary,
                    lineHeight: '1.2',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {user?.role || AdminUserRole.SUPPORT}
                  </div>
                </div>
              </div>
            </Dropdown>
          </Header>
          
          {/* 메인 콘텐츠 */}
          <Content>{children}</Content>
        </Layout>
      </Layout>
    </Layout>
  );
};
