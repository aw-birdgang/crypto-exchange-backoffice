import React from 'react';
import { Tag } from 'antd';

export type TransactionStatus = 'completed' | 'pending' | 'failed';

interface TransactionStatusTagProps {
  status: TransactionStatus;
  text?: string;
}

const statusConfig = {
  completed: { color: 'green', text: '완료' },
  pending: { color: 'orange', text: '대기' },
  failed: { color: 'red', text: '실패' },
};

export const TransactionStatusTag: React.FC<TransactionStatusTagProps> = ({
  status,
  text,
}) => {
  const config = statusConfig[status] || { color: 'default', text: status };
  return (
    <Tag color={config.color}>
      {text || config.text}
    </Tag>
  );
};
