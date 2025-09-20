import React from 'react';
import { Tag } from 'antd';
import { Resource } from '@crypto-exchange/shared';

interface ResourceTagProps {
  resource: Resource;
  color?: string;
}

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

export const ResourceTag: React.FC<ResourceTagProps> = ({
  resource,
  color = 'blue',
}) => {
  return (
    <Tag color={color}>
      {resourceLabels[resource] || resource}
    </Tag>
  );
};
