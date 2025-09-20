import React from 'react';
import { Tag } from 'antd';
import { UserStatus } from '@crypto-exchange/shared';

interface UserStatusBadgeProps {
  status: UserStatus;
  className?: string;
}

const statusConfig = {
  [UserStatus.PENDING]: {
    label: '대기중',
    color: 'warning',
  },
  [UserStatus.APPROVED]: {
    label: '승인됨',
    color: 'success',
  },
  [UserStatus.REJECTED]: {
    label: '거부됨',
    color: 'error',
  },
  [UserStatus.SUSPENDED]: {
    label: '정지됨',
    color: 'default',
  },
};

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ 
  status, 
  className = '' 
}) => {
  const config = statusConfig[status];

  return (
    <Tag color={config.color} className={className}>
      {config.label}
    </Tag>
  );
};
