import React, { useState, useMemo } from 'react';
import { Table, Checkbox, Space, Typography, Tag, Button } from 'antd';
import { Resource, Permission, UserRole } from '@crypto-exchange/shared';

const { Title, Text } = Typography;

interface PermissionMatrixProps {
  permissions: {
    resource: Resource;
    permissions: Permission[];
  }[];
  role?: UserRole;
  onChange?: (permissions: { resource: Resource; permissions: Permission[] }[]) => void;
  readOnly?: boolean;
  showResourceDescription?: boolean;
}

const resourceLabels: Record<Resource, string> = {
  [Resource.DASHBOARD]: '대시보드',
  [Resource.SETTINGS]: '설정',
};

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

const resourceDescriptions: Record<Resource, string> = {
  [Resource.DASHBOARD]: '시스템 대시보드 및 통계 정보',
  [Resource.SETTINGS]: '시스템 설정 및 구성',
};

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  permissions,
  role,
  onChange,
  readOnly = false,
  showResourceDescription = true,
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<{
    resource: Resource;
    permissions: Permission[];
  }[]>(permissions);

  const allResources = Object.values(Resource);
  const allPermissions = Object.values(Permission);

  const handlePermissionChange = (resource: Resource, permission: Permission, checked: boolean) => {
    if (readOnly) return;

    const newPermissions = selectedPermissions.map(p => {
      if (p.resource === resource) {
        if (checked) {
          // 권한 추가
          if (!p.permissions.includes(permission)) {
            return {
              ...p,
              permissions: [...p.permissions, permission],
            };
          }
        } else {
          // 권한 제거
          return {
            ...p,
            permissions: p.permissions.filter(p => p !== permission),
          };
        }
      }
      return p;
    });

    // 새로운 리소스 추가
    if (!selectedPermissions.find(p => p.resource === resource)) {
      newPermissions.push({
        resource,
        permissions: checked ? [permission] : [],
      });
    }

    setSelectedPermissions(newPermissions);
    onChange?.(newPermissions);
  };

  const handleResourceSelectAll = (resource: Resource, checked: boolean) => {
    if (readOnly) return;

    const newPermissions = selectedPermissions.map(p => {
      if (p.resource === resource) {
        return {
          ...p,
          permissions: checked ? [...allPermissions] : [],
        };
      }
      return p;
    });

    if (!selectedPermissions.find(p => p.resource === resource)) {
      newPermissions.push({
        resource,
        permissions: checked ? [...allPermissions] : [],
      });
    }

    setSelectedPermissions(newPermissions);
    onChange?.(newPermissions);
  };

  const isResourceSelected = (resource: Resource) => {
    const resourcePermission = selectedPermissions.find(p => p.resource === resource);
    return resourcePermission && resourcePermission.permissions.length === allPermissions.length;
  };

  const isResourceIndeterminate = (resource: Resource) => {
    const resourcePermission = selectedPermissions.find(p => p.resource === resource);
    return resourcePermission && 
           resourcePermission.permissions.length > 0 && 
           resourcePermission.permissions.length < allPermissions.length;
  };

  const isPermissionSelected = (resource: Resource, permission: Permission) => {
    const resourcePermission = selectedPermissions.find(p => p.resource === resource);
    return resourcePermission?.permissions.includes(permission) || false;
  };

  const columns = [
    {
      title: '리소스',
      dataIndex: 'resource',
      key: 'resource',
      width: 200,
      render: (resource: Resource) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {resourceLabels[resource]}
          </div>
          {showResourceDescription && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {resourceDescriptions[resource]}
            </Text>
          )}
        </div>
      ),
    },
    ...allPermissions.map(permission => ({
      title: (
        <div style={{ textAlign: 'center' }}>
          <Tag color={permissionColors[permission]}>
            {permissionLabels[permission]}
          </Tag>
        </div>
      ),
      dataIndex: permission,
      key: permission,
      width: 100,
      align: 'center' as const,
      render: (_: any, record: { resource: Resource }) => (
        <Checkbox
          checked={isPermissionSelected(record.resource, permission)}
          onChange={(e) => handlePermissionChange(record.resource, permission, e.target.checked)}
          disabled={readOnly}
        />
      ),
    })),
    {
      title: '전체 선택',
      key: 'selectAll',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: { resource: Resource }) => (
        <Checkbox
          checked={isResourceSelected(record.resource)}
          indeterminate={isResourceIndeterminate(record.resource)}
          onChange={(e) => handleResourceSelectAll(record.resource, e.target.checked)}
          disabled={readOnly}
        />
      ),
    },
  ];

  const dataSource = allResources.map(resource => ({
    key: resource,
    resource,
  }));

  const selectedCount = useMemo(() => {
    return selectedPermissions.reduce((total, p) => total + p.permissions.length, 0);
  }, [selectedPermissions]);

  const totalCount = allResources.length * allPermissions.length;

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            권한 매트릭스
            {role && ` - ${role}`}
          </Title>
          <Text type="secondary">
            선택된 권한: {selectedCount} / {totalCount}
          </Text>
        </div>
        {!readOnly && (
          <Space>
            <Button
              size="small"
              onClick={() => {
                const allSelected = allResources.map(resource => ({
                  resource,
                  permissions: [...allPermissions],
                }));
                setSelectedPermissions(allSelected);
                onChange?.(allSelected);
              }}
            >
              전체 선택
            </Button>
            <Button
              size="small"
              onClick={() => {
                setSelectedPermissions([]);
                onChange?.([]);
              }}
            >
              전체 해제
            </Button>
          </Space>
        )}
      </div>
      
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        scroll={{ x: 'max-content' }}
        style={{ 
          border: '1px solid #f0f0f0',
          borderRadius: '6px',
        }}
      />
    </div>
  );
};

export default PermissionMatrix;
