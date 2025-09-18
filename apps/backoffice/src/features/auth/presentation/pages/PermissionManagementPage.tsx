import React, { useState } from 'react';
import { Card, Typography, Tabs, Space, Table, Tag, Badge } from 'antd';
import {
  TeamOutlined,
  LockOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { usePermissions } from '../../application/hooks/usePermissions';
import { Resource, Permission, UserRole } from '@crypto-exchange/shared';
import RoleManagementPage from './RoleManagementPage';
import UserPermissionManagementPage from './UserPermissionManagementPage';

const { Title, Text } = Typography;

export const PermissionManagementPage: React.FC = () => {
  const { permissions, loading } = usePermissions();
  const [activeTab, setActiveTab] = useState('overview');

  const columns = [
    {
      title: '리소스',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource: Resource) => {
        const resourceLabels: Record<Resource, string> = {
          [Resource.DASHBOARD]: '대시보드',
          [Resource.SETTINGS]: '설정',
          [Resource.PERMISSIONS]: '권한 관리',
          [Resource.USERS]: '사용자 관리',
          [Resource.ROLES]: '역할 관리',
        };
        return (
          <Tag color="blue">
            {resourceLabels[resource] || resource}
          </Tag>
        );
      },
    },
    {
      title: '권한',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: Permission[]) => (
        <Space wrap>
          {permissions.map(permission => {
            const permissionLabels: Record<Permission, string> = {
              [Permission.CREATE]: '생성',
              [Permission.READ]: '조회',
              [Permission.UPDATE]: '수정',
              [Permission.DELETE]: '삭제',
              [Permission.MANAGE]: '관리',
            };
            const permissionColors: Record<Permission, string> = {
              [Permission.CREATE]: 'green',
              [Permission.READ]: 'blue',
              [Permission.UPDATE]: 'orange',
              [Permission.DELETE]: 'red',
              [Permission.MANAGE]: 'purple',
            };
            return (
              <Tag key={permission} color={permissionColors[permission]}>
                {permissionLabels[permission]}
              </Tag>
            );
          })}
        </Space>
      ),
    },
  ];

  // 모든 리소스에 대한 권한을 표시하도록 개선
  const allResources = [
    Resource.DASHBOARD,
    Resource.SETTINGS,
    Resource.PERMISSIONS,
    Resource.ROLES,
  ];

  const dataSource = allResources.map(resource => {
    const userPermission = permissions?.permissions?.find(p => p.resource === resource);
    return {
      resource,
      permissions: userPermission?.permissions || [],
    };
  });

  const roleLabels: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: '최고 관리자',
    [UserRole.ADMIN]: '관리자',
    [UserRole.USER]: '사용자',
  };

  const roleColors: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'red',
    [UserRole.ADMIN]: 'blue',
    [UserRole.USER]: 'default',
  };

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
        <div>
          <Card
            title="현재 사용자 정보"
            style={{ marginBottom: 16 }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div>
                  <Text strong>역할: </Text>
                  <Tag color={roleColors[permissions?.role as UserRole] || 'default'}>
                    {roleLabels[permissions?.role as UserRole] || permissions?.role}
                  </Tag>
                </div>
                <div>
                  <Text strong>권한 수: </Text>
                  <Badge count={dataSource.length} showZero color="blue" />
                </div>
              </div>
            </Space>
          </Card>

          <Card title="내 권한 목록">
            <Table
              columns={columns}
              dataSource={dataSource}
              loading={loading}
              rowKey="resource"
              pagination={false}
              size="small"
            />
          </Card>
        </div>
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
    {
      key: 'users',
      label: (
        <span>
          <TeamOutlined />
          사용자 권한 관리
        </span>
      ),
      children: <UserPermissionManagementPage />,
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
