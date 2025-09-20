import React from 'react';
import { Menu, theme } from 'antd';
import {
  WalletOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';

export type MainCategory = 'wallet' | 'customer' | 'admin';

interface TopNavigationProps {
  activeCategory: MainCategory;
  onCategoryChange: (category: MainCategory) => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  const { token } = theme.useToken();

  const mainCategories = [
    {
      key: 'wallet' as MainCategory,
      icon: <WalletOutlined />,
      label: '지갑관리',
    },
    {
      key: 'customer' as MainCategory,
      icon: <UserOutlined />,
      label: '고객관리',
    },
    {
      key: 'admin' as MainCategory,
      icon: <TeamOutlined />,
      label: '관리자 계정 관리',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    onCategoryChange(key as MainCategory);
  };

  return (
    <div
      style={{
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorder}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <Menu
          mode="horizontal"
          selectedKeys={[activeCategory]}
          items={mainCategories}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            background: 'transparent',
            lineHeight: '64px',
            height: '64px',
          }}
        />
      </div>
    </div>
  );
};
