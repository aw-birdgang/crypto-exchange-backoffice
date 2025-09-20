import React from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TransactionOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { MainCategory } from './TopNavigation';
import { ROUTES, Resource, Permission, AdminUserRole } from '@crypto-exchange/shared';

const { Sider } = Layout;

interface CategorySidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  activeCategory: MainCategory;
  selectedKeys: string[];
  onMenuClick: (key: string) => void;
  hasPermission: (resource: Resource, permission: Permission) => boolean;
  permissionsLoading: boolean;
  permissions: any;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  collapsed,
  onCollapse,
  activeCategory,
  selectedKeys,
  onMenuClick,
  hasPermission,
  permissionsLoading,
  permissions,
}) => {
  const { token } = theme.useToken();

  // 지갑관리 메뉴
  const walletMenuItems = [
    {
      key: ROUTES.WALLET.TRANSACTIONS,
      icon: <TransactionOutlined />,
      label: '거래 내역',
      requiredPermission: { resource: Resource.WALLET_TRANSACTIONS, permission: Permission.READ },
    },
  ];

  // 고객관리 메뉴 (일반 사용자 관리)
  const customerMenuItems = [
    {
      key: ROUTES.CUSTOMER.SUPPORT,
      icon: <SettingOutlined />,
      label: '고객 지원',
      requiredPermission: { resource: Resource.CUSTOMER_SUPPORT, permission: Permission.READ },
    },
  ];

  // 어드민 계정 관리 메뉴 (AdminUser 관리)
  const adminMenuItems = [
    {
      key: ROUTES.ADMIN.USERS,
      icon: <UserOutlined />,
      label: '계정 관리',
      requiredPermission: { resource: Resource.ADMIN_USERS, permission: Permission.READ },
    },
    {
      key: ROUTES.ADMIN.PERMISSIONS,
      icon: <TeamOutlined />,
      label: '권한 관리',
      requiredPermission: { resource: Resource.PERMISSIONS, permission: Permission.READ },
    },
  ];

  const getMenuItems = () => {
    switch (activeCategory) {
      case 'wallet':
        return walletMenuItems;
      case 'customer':
        return customerMenuItems;
      case 'admin':
        return adminMenuItems;
      default:
        return [];
    }
  };

  const getCategoryTitle = () => {
    switch (activeCategory) {
      case 'wallet':
        return '지갑관리';
      case 'customer':
        return '고객관리';
      case 'admin':
        return '관리자 계정 관리';
      default:
        return '관리 시스템';
    }
  };

  const getCategoryIcon = () => {
    switch (activeCategory) {
      case 'wallet':
        return <TransactionOutlined />;
      case 'customer':
        return <UserOutlined />;
      case 'admin':
        return <TeamOutlined />;
      default:
        return <TransactionOutlined />;
    }
  };

  const filterMenuItems = (items: any[]) => {
    if (permissionsLoading || !permissions) {
      return items.map(item => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
      }));
    }

    // SUPER_ADMIN은 모든 메뉴에 접근 가능
    if (permissions?.role === AdminUserRole.SUPER_ADMIN) {
      return items.map(item => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
      }));
    }

    return items
      .filter(item => {
        if (item.requiredPermission) {
          try {
            return hasPermission(item.requiredPermission.resource, item.requiredPermission.permission);
          } catch (error) {
            console.warn('Permission check failed, allowing access:', error);
            return true;
          }
        }
        return true;
      })
      .map(item => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
      }));
  };

  const menuItems = filterMenuItems(getMenuItems());

  return (
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
          padding: '0 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getCategoryIcon()}
          {!collapsed && (
            <span style={{
              color: token.colorPrimary,
              fontWeight: 600,
              fontSize: '14px'
            }}>
              {getCategoryTitle()}
            </span>
          )}
        </div>
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={selectedKeys}
        items={menuItems}
        onClick={({ key }) => onMenuClick(key)}
        style={{ border: 'none' }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: `1px solid ${token.colorBorder}`,
        }}
      >
        <div
          onClick={() => onCollapse(!collapsed)}
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = token.colorFillSecondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </div>
    </Sider>
  );
};
