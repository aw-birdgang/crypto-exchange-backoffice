import React from 'react';
import { Button, Space } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';

interface RoleActionsProps {
  onCreateRole: () => void;
  onShowPermissions: () => void;
}

export const RoleActions: React.FC<RoleActionsProps> = ({
  onCreateRole,
  onShowPermissions,
}) => {
  return (
    <Space>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={onCreateRole}
      >
        역할 생성
      </Button>
      <Button
        icon={<SettingOutlined />}
        onClick={onShowPermissions}
      >
        권한 매트릭스
      </Button>
    </Space>
  );
};
