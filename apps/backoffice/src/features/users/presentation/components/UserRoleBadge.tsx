import React from 'react';
import { Tag } from 'antd';
import { AdminUserRole } from '@crypto-exchange/shared';

interface UserRoleBadgeProps {
  role: AdminUserRole;
  className?: string;
}

const roleConfig = {
  [AdminUserRole.SUPER_ADMIN]: {
    label: '최고관리자',
    color: 'purple',
  },
  [AdminUserRole.ADMIN]: {
    label: '관리자',
    color: 'blue',
  },
  [AdminUserRole.MODERATOR]: {
    label: '모더레이터',
    color: 'orange',
  },
  [AdminUserRole.SUPPORT]: {
    label: '지원팀',
    color: 'cyan',
  },
  [AdminUserRole.AUDITOR]: {
    label: '감사자',
    color: 'indigo',
  },
};

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ 
  role, 
  className = '' 
}) => {
  const config = roleConfig[role];

  return (
    <Tag color={config.color} className={className}>
      {config.label}
    </Tag>
  );
};
