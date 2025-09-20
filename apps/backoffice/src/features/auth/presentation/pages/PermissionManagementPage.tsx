import React, { useState } from 'react';
import { Card, Typography, Tabs } from 'antd';
import {
  LockOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { usePermissions } from '../../application/hooks/usePermissions';
import RoleManagementPage from './RoleManagementPage';
import { PermissionOverview } from '../components/PermissionOverview';

const { Title, Text } = Typography;

export const PermissionManagementPage: React.FC = () => {
  const { permissions, loading } = usePermissions();
  const [activeTab, setActiveTab] = useState('overview');


  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <BarChartOutlined />
          권한 개요
        </span>
      ),
      children: (
        <PermissionOverview
          permissions={permissions}
          loading={loading}
        />
      ),
    },
    {
      key: 'roles',
      label: (
        <span>
          <LockOutlined />
          역할 관리
        </span>
      ),
      children: <RoleManagementPage />,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>권한 관리</Title>
        <Text type="secondary">
          시스템의 권한과 역할을 관리합니다. 사용자에게 적절한 권한을 부여하여 보안을 유지하세요.
        </Text>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>
    </div>
  );
};
