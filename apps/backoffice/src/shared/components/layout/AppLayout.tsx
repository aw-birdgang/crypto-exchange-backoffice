import React, { useState, useMemo } from 'react';
import { Layout, Avatar, Dropdown, theme, Button, Space, Badge, Tooltip } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/application/stores/auth.store';
import { usePermissions } from '../../../features/auth/application/hooks/usePermissions';
import { useTheme } from '../../../shared/theme';
import { useResponsive } from '../../../shared/hooks';
import { ROUTES, AdminUserRole } from '@crypto-exchange/shared';
import { TopNavigation, MainCategory } from './TopNavigation';
import { CategorySidebar } from './CategorySidebar';
import { MobileNavigationDrawer, MobileDrawerTrigger } from './MobileDrawer';

const { Header, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MainCategory>('wallet');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { hasPermission, loading: permissionsLoading, permissions } = usePermissions();
  const { theme: appTheme, toggleTheme } = useTheme();
  const { token } = theme.useToken();
  const { isMobile, isTablet, getSidebarMode } = useResponsive();

  // 레이아웃 준비 상태 설정
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLayoutReady(true);
    }, 100); // 짧은 지연으로 레이아웃 안정화

    return () => clearTimeout(timer);
  }, []);

  // 초기 로드 완료 상태 설정
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 300); // 초기 로드 완료 후 안정화

    return () => clearTimeout(timer);
  }, []);

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
      type: 'divider' as const,
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
        navigate(ROUTES.ADMIN.USERS);
        break;
    }
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    const item = userMenuItems.find((item) => item.key === key);
    if (item?.onClick) {
      item.onClick();
    }
  };

  // 사이드바 모드에 따른 렌더링 결정
  const sidebarMode = getSidebarMode();
  const showSidebar = sidebarMode === 'fixed' || sidebarMode === 'collapsible';
  const showMobileDrawer = sidebarMode === 'drawer';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 상단 메인 카테고리 네비게이션 (데스크톱에서만 표시) */}
      {!isMobile && (
        <TopNavigation
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}
      
      <Layout>
        {/* 왼쪽 사이드바 (데스크톱/태블릿) */}
        {showSidebar && (
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
        )}
        
        <Layout>
          {/* 상단 헤더 */}
          <Header
            style={{
              padding: isMobile ? '0 16px' : '0 24px',
              background: token.colorBgContainer,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              minHeight: '64px',
              position: 'relative',
              borderBottom: `1px solid ${token.colorBorder}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
              {/* 모바일 메뉴 버튼 또는 사이드바 토글 버튼 */}
              {showMobileDrawer ? (
                <MobileDrawerTrigger
                  onClick={() => setMobileMenuOpen(true)}
                />
              ) : showSidebar ? (
                <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                    fontSize: '16px',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              ) : null}
              
              <h2 style={{ 
                color: token.colorPrimary, 
                margin: 0,
                fontSize: isMobile ? '18px' : '20px',
                fontWeight: 700,
                letterSpacing: '-0.025em',
              }}>
                {isMobile ? 'Crypto' : 'Crypto Exchange'}
              </h2>
            </div>
            
            <Space size={isMobile ? 'small' : 'middle'}>
              {/* 알림 버튼 */}
              <Tooltip title="알림">
                <Badge count={3} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    style={{
                      width: isMobile ? 36 : 40,
                      height: isMobile ? 36 : 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                </Badge>
              </Tooltip>
              
              {/* 테마 토글 버튼 */}
              <Tooltip title={appTheme.mode === 'light' ? '다크 모드' : '라이트 모드'}>
                <Button
                  type="text"
                  icon={appTheme.mode === 'light' ? <MoonOutlined /> : <SunOutlined />}
                  onClick={toggleTheme}
                  style={{
                    width: isMobile ? 36 : 40,
                    height: isMobile ? 36 : 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              </Tooltip>
              
              {/* 사용자 메뉴 */}
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick,
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: isMobile ? '6px 8px' : '8px 12px',
                    borderRadius: '8px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    minWidth: isMobile ? '80px' : '120px',
                    maxWidth: isMobile ? '120px' : '200px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    border: `1px solid ${token.colorBorder}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = token.colorFillSecondary;
                    e.currentTarget.style.borderColor = token.colorPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = token.colorBorder;
                  }}
                >
                  <Avatar
                    size={isMobile ? 'small' : 'default'}
                    style={{
                      backgroundColor: token.colorPrimary,
                      marginRight: isMobile ? 4 : 8,
                      fontSize: isMobile ? '12px' : '14px',
                      fontWeight: 600,
                    }}
                  >
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  {!isMobile && (
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
                        color: token.colorText,
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
                        {user?.adminRole || AdminUserRole.SUPPORT}
                      </div>
                    </div>
                  )}
                </div>
              </Dropdown>
            </Space>
          </Header>
          
          {/* 메인 콘텐츠 */}
          <Content 
            className={`fade-in ${isLayoutReady ? 'layout-ready' : 'layout-loading'} ${isInitialLoad ? 'initial-loading' : 'initial-loaded'}`}
            style={{
              padding: isMobile ? '16px' : '24px',
              background: '#f8fafc',
              minHeight: 'calc(100vh - 64px)',
              opacity: isLayoutReady && !isInitialLoad ? 1 : 0.8,
              transform: isInitialLoad ? 'translateY(20px)' : 'translateY(0)',
              transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>

      {/* 모바일 네비게이션 드로어 */}
      {showMobileDrawer && (
        <MobileNavigationDrawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          title="메뉴"
        >
          {/* 모바일용 카테고리 네비게이션 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 600, 
              color: '#8c8c8c',
              marginBottom: '12px',
              padding: '0 16px'
            }}>
              카테고리
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { key: 'wallet', label: '지갑관리', icon: '💳' },
                { key: 'customer', label: '고객관리', icon: '👥' },
                { key: 'admin', label: '관리자 계정 관리', icon: '⚙️' },
              ].map((category) => (
                <Button
                  key={category.key}
                  type={activeCategory === category.key ? 'primary' : 'text'}
                  block
                  style={{
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    padding: '0 16px',
                    fontSize: '16px',
                    fontWeight: activeCategory === category.key ? 600 : 400,
                  }}
                  onClick={() => {
                    handleCategoryChange(category.key as MainCategory);
                    setMobileMenuOpen(false);
                  }}
                >
                  <span style={{ marginRight: '12px', fontSize: '18px' }}>
                    {category.icon}
                  </span>
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 모바일용 사이드바 메뉴 */}
          <CategorySidebar
            collapsed={false}
            onCollapse={() => {}}
            activeCategory={activeCategory}
            selectedKeys={[location.pathname]}
            onMenuClick={(key) => {
              handleMenuClick(key);
              setMobileMenuOpen(false);
            }}
            hasPermission={hasPermission}
            permissionsLoading={permissionsLoading}
            permissions={permissions}
          />
        </MobileNavigationDrawer>
      )}
    </Layout>
  );
};
