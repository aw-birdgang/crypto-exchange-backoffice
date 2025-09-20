import React from 'react';
import { Table, Tag, Card } from 'antd';

interface Transaction {
  id: string;
  transactionId: string;
  walletId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  fee: number;
  timestamp: string;
  from: string;
  to: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const columns = [
    {
      title: '거래 ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 120,
    },
    {
      title: '지갑 ID',
      dataIndex: 'walletId',
      key: 'walletId',
      width: 100,
    },
    {
      title: '유형',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap = {
          deposit: { color: 'green', text: '입금' },
          withdrawal: { color: 'red', text: '출금' },
          transfer: { color: 'blue', text: '이체' },
        };
        const config = typeMap[type as keyof typeof typeMap] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '금액',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number, record: Transaction) => `${amount} ${record.currency}`,
    },
    {
      title: '수수료',
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      render: (fee: number, record: Transaction) => `${fee} ${record.currency}`,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          completed: { color: 'green', text: '완료' },
          pending: { color: 'orange', text: '대기' },
          failed: { color: 'red', text: '실패' },
        };
        const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'From',
      dataIndex: 'from',
      key: 'from',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'To',
      dataIndex: 'to',
      key: 'to',
      width: 150,
      ellipsis: true,
    },
    {
      title: '시간',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
    },
  ];

  return (
    <Card>
      <Table
        columns={columns}
        dataSource={transactions}
        rowKey="id"
        pagination={{
          total: transactions.length,
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} / ${total}건`,
        }}
        scroll={{ x: 1000 }}
      />
    </Card>
  );
};
