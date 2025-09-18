import React, { useState, useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/application/stores/auth.store';
import { usePermissions } from '../../../features/auth/application/hooks/usePermissions';
import { ROUTES, Resource, Permission } from '@crypto-exchange/shared';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { hasPermission, loading: permissionsLoading, permissions } = usePermissions();
  const { token } = theme.useToken();

  const allMenuItems = [
    {
      key: ROUTES.DASHBOARD,
      icon: <DashboardOutlined />,
      label: '대시보드',
      menuKey: 'dashboard',
      requiredPermission: { resource: Resource.DASHBOARD, permission: Permission.READ },
    },
    {
      key: ROUTES.PERMISSIONS,
      icon: <TeamOutlined />,
      label: '권한 관리',
      menuKey: 'permissions',
      requiredPermission: { resource: Resource.PERMISSIONS, permission: Permission.READ },
    },
  ];

  const menuItems = useMemo(() => {
    // 권한이 로딩 중이거나 아직 로드되지 않은 경우, 기본 메뉴를 표시
    if (permissionsLoading || !permissions) {
      console.log('🔄 Permissions loading, showing default menu items');
      return allMenuItems.map(item => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
      }));
    }

    console.log('🔍 Current user permissions:', permissions);
    console.log('🔍 User role:', permissions?.role);

    // SUPER_ADMIN은 모든 메뉴에 접근 가능
    if (permissions?.role === 'super_admin') {
      console.log('✅ SUPER_ADMIN has access to all menus');
      return allMenuItems.map(item => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
      }));
    }

    return allMenuItems
      .filter(item => {
        // 권한 확인
        if (item.requiredPermission) {
          try {
            const hasAccess = hasPermission(item.requiredPermission.resource, item.requiredPermission.permission);
            console.log(`🔍 Permission check for ${item.label} (${item.requiredPermission.resource}.${item.requiredPermission.permission}):`, hasAccess);
            return hasAccess;
          } catch (error) {
            console.warn('Permission check failed, allowing access:', error);
            return true; // 에러 시 기본적으로 허용
          }
        }
        return true;
      })
      .map(item => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
      }));
  }, [hasPermission, permissionsLoading, permissions]);

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

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    const item = userMenuItems.find((item) => item.key === key);
    if (item?.onClick) {
      item.onClick();
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: token.colorBgContainer,
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${token.colorBorder}`,
          }}
        >
          <h2 style={{ color: token.colorPrimary, margin: 0 }}>
            {collapsed ? 'CE' : 'Crypto Exchange'}
          </h2>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
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
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
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
                  {user?.role || 'user'}
                </div>
              </div>
            </div>
          </Dropdown>
        </Header>
        <Content>{children}</Content>
      </Layout>
    </Layout>
  );
};
