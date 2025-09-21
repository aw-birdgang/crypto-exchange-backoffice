import React from 'react';
import {Button, Space} from 'antd';
import {PlusOutlined} from '@ant-design/icons';

interface RoleActionsProps {
  onCreateRole: () => void;
}

export const RoleActions: React.FC<RoleActionsProps> = ({
  onCreateRole,
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
    </Space>
  );
};
