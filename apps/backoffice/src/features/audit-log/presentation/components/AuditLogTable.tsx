import React from 'react';
import {
  Table,
  Tag,
  Space,
  Button,
  Tooltip,
  Typography,
  Popconfirm,
  message,
} from 'antd';
import {
  EyeOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useAuditLogs } from '../../application/hooks/use-audit-logs';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import dayjs from 'dayjs';

const { Text } = Typography;

export const AuditLogTable: React.FC = () => {
  const {
    logs,
    pagination,
    loading,
    handlePageChange,
    handlePageSizeChange,
  } = useAuditLogs();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'high':
        return <WarningOutlined style={{ color: '#fa8c16' }} />;
      case 'medium':
        return <InfoCircleOutlined style={{ color: '#faad14' }} />;
      case 'low':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'failure':
        return 'red';
      case 'warning':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failure':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const columns = [
    {
      title: '시간',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => (
        <Text type="secondary">
          {dayjs(date).format('YYYY-MM-DD HH:mm:ss')}
        </Text>
      ),
      sorter: true,
    },
    {
      title: '사용자',
      key: 'user',
      width: 200,
      render: (record: AuditLog) => (
        <div>
          <div>
            <Text strong>{record.userName}</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.userEmail}
            </Text>
          </div>
          <div>
            <Tag color="blue">
              {record.userRole}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: '액션',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action: string) => (
        <Tag color="blue">{action}</Tag>
      ),
    },
    {
      title: '리소스',
      dataIndex: 'resource',
      key: 'resource',
      width: 120,
      render: (resource: string) => (
        <Tag color="purple">{resource}</Tag>
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Space>
          {getStatusIcon(status)}
          <Tag color={getStatusColor(status)}>
            {status}
          </Tag>
        </Space>
      ),
    },
    {
      title: '심각도',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => (
        <Space>
          {getSeverityIcon(severity)}
          <Tag color={getSeverityColor(severity)}>
            {severity}
          </Tag>
        </Space>
      ),
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => (
        <Tag color="cyan">{category}</Tag>
      ),
    },
    {
      title: 'IP 주소',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 120,
      render: (ip: string) => (
        <Text code>{ip}</Text>
      ),
    },
    {
      title: '상세 정보',
      key: 'details',
      width: 100,
      render: (record: AuditLog) => (
        <Tooltip title={JSON.stringify(record.details, null, 2)}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
          >
            보기
          </Button>
        </Tooltip>
      ),
    },
    {
      title: '메타데이터',
      key: 'metadata',
      width: 100,
      render: (record: AuditLog) => (
        <Tooltip title={JSON.stringify(record.metadata, null, 2)}>
          <Button
            type="link"
            size="small"
            icon={<InfoCircleOutlined />}
          >
            보기
          </Button>
        </Tooltip>
      ),
    },
  ];

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (pagination.current !== pagination.page) {
      handlePageChange(pagination.current);
    }
    if (pagination.pageSize !== pagination.limit) {
      handlePageSizeChange(pagination.pageSize);
    }
  };

  return (
    <Table
      columns={columns}
      dataSource={logs}
      loading={loading}
      rowKey="id"
      pagination={{
        current: pagination.page,
        pageSize: pagination.limit,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      onChange={handleTableChange}
      scroll={{ x: 1200 }}
      size="small"
    />
  );
};
