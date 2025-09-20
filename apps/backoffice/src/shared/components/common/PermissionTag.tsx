import React from 'react';
import { Tag, Space } from 'antd';
import { Permission } from '@crypto-exchange/shared';

interface PermissionTagProps {
  permissions: Permission[];
  wrap?: boolean;
}

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

export const PermissionTag: React.FC<PermissionTagProps> = ({
  permissions,
  wrap = true,
}) => {
  return (
    <Space wrap={wrap}>
      {permissions.map(permission => (
        <Tag key={permission} color={permissionColors[permission]}>
          {permissionLabels[permission]}
        </Tag>
      ))}
    </Space>
  );
};
