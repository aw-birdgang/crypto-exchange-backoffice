import React from 'react';
import { Tag } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

export type StatusType = 'active' | 'inactive' | 'pending' | 'expired' | 'expiring';

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  showIcon?: boolean;
}

const statusConfig = {
  active: { color: 'green', text: '활성', icon: <CheckCircleOutlined /> },
  inactive: { color: 'default', text: '비활성', icon: null },
  pending: { color: 'orange', text: '대기', icon: <ClockCircleOutlined /> },
  expired: { color: 'red', text: '만료됨', icon: <ClockCircleOutlined /> },
  expiring: { color: 'orange', text: '만료 예정', icon: <ClockCircleOutlined /> },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  showIcon = true,
}) => {
  const config = statusConfig[status];
  const displayText = text || config.text;
  const icon = showIcon ? config.icon : null;

  return (
    <Tag color={config.color} icon={icon}>
      {displayText}
    </Tag>
  );
};
