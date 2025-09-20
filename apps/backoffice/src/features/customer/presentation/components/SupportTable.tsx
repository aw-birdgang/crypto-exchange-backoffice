import React from 'react';
import { Table, Tag, Avatar, Card } from 'antd';
import { 
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

interface SupportTicket {
  id: string;
  ticketId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  assignedTo: string;
  createdAt: string;
  lastUpdated: string;
}

interface SupportTableProps {
  tickets: SupportTicket[];
}

export const SupportTable: React.FC<SupportTableProps> = ({ tickets }) => {
  const columns = [
    {
      title: '티켓 ID',
      dataIndex: 'ticketId',
      key: 'ticketId',
      width: 100,
    },
    {
      title: '고객',
      key: 'customer',
      width: 200,
      render: (record: SupportTicket) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
            {record.customerName[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.customerName}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.customerEmail}</div>
          </div>
        </div>
      ),
    },
    {
      title: '제목',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          open: { color: 'red', text: '열림', icon: <ClockCircleOutlined /> },
          in_progress: { color: 'orange', text: '진행중', icon: <ClockCircleOutlined /> },
          resolved: { color: 'green', text: '해결됨', icon: <CheckCircleOutlined /> },
          closed: { color: 'default', text: '닫힘', icon: <CloseCircleOutlined /> },
        };
        const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status, icon: null };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '우선순위',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        const priorityMap = {
          high: { color: 'red', text: '높음' },
          medium: { color: 'orange', text: '보통' },
          low: { color: 'green', text: '낮음' },
        };
        const config = priorityMap[priority as keyof typeof priorityMap] || { color: 'default', text: priority };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '담당자',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 120,
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
    },
  ];

  return (
    <Card>
      <Table
        columns={columns}
        dataSource={tickets}
        rowKey="id"
        pagination={{
          total: tickets.length,
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
