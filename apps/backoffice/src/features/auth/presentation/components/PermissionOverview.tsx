import React from 'react';
import { Card, Space, Tag, Badge, Table } from 'antd';
import { Resource, Permission, AdminUserRole } from '@crypto-exchange/shared';
import { Typography } from 'antd';

const { Text } = Typography;

interface PermissionOverviewProps {
  permissions: any;
  loading: boolean;
}

export const PermissionOverview: React.FC<PermissionOverviewProps> = ({
  permissions,
  loading,
}) => {
  const columns = [
    {
      title: '리소스',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource: Resource) => {
        const resourceLabels: Record<Resource, string> = {
          [Resource.DASHBOARD]: '대시 보드',
          [Resource.SETTINGS]: '설정',
          [Resource.PERMISSIONS]: '권한 관리',
          [Resource.USERS]: '사용자 관리',
          [Resource.ROLES]: '역할 관리',
          [Resource.WALLET]: '지갑',
          [Resource.WALLET_TRANSACTIONS]: '지갑 거래',
          [Resource.CUSTOMER_SUPPORT]: '고객 지원',
          [Resource.ADMIN_USERS]: '관리자 계정',
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
    const userPermission = permissions?.permissions?.find((p: any) => p.resource === resource);
    return {
      resource,
      permissions: userPermission?.permissions || [],
    };
  });

  const roleLabels: Record<AdminUserRole, string> = {
    [AdminUserRole.SUPER_ADMIN]: '최고 관리자',
    [AdminUserRole.ADMIN]: '관리자',
    [AdminUserRole.MODERATOR]: '모더레이터',
    [AdminUserRole.SUPPORT]: '고객 지원',
    [AdminUserRole.AUDITOR]: '감사자',
  };

  const roleColors: Record<AdminUserRole, string> = {
    [AdminUserRole.SUPER_ADMIN]: 'red',
    [AdminUserRole.ADMIN]: 'blue',
    [AdminUserRole.MODERATOR]: 'orange',
    [AdminUserRole.SUPPORT]: 'green',
    [AdminUserRole.AUDITOR]: 'purple',
  };

  return (
    <div>
      <Card
        title="현재 사용자 정보"
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <Text strong>역할: </Text>
              <Tag color={roleColors[permissions?.role as AdminUserRole] || 'default'}>
                {roleLabels[permissions?.role as AdminUserRole] || permissions?.role}
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
  );
};
