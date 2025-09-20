import React from 'react';
import { Tag } from 'antd';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer';

interface TransactionTypeTagProps {
  type: TransactionType;
  text?: string;
}

const typeConfig = {
  deposit: { color: 'green', text: '입금' },
  withdrawal: { color: 'red', text: '출금' },
  transfer: { color: 'blue', text: '이체' },
};

export const TransactionTypeTag: React.FC<TransactionTypeTagProps> = ({
  type,
  text,
}) => {
  const config = typeConfig[type] || { color: 'default', text: type };
  return (
    <Tag color={config.color}>
      {text || config.text}
    </Tag>
  );
};
