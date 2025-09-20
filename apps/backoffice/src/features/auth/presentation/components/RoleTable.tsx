import React from 'react';
import {Badge, Button, Popconfirm, Space, Table, Tag, Tooltip, Typography} from 'antd';
import {DeleteOutlined, EditOutlined, LockOutlined} from '@ant-design/icons';
import {Role} from '@crypto-exchange/shared';

const { Text } = Typography;

interface RoleTableProps {
  roles: Role[];
  loading: boolean;
  isSuperAdmin: boolean;
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
}

export const RoleTable: React.FC<RoleTableProps> = ({
  roles,
  loading,
  isSuperAdmin,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      title: '역할명',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Role) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          {record.isSystem && !isSuperAdmin && (
            <Tag color="blue" icon={<LockOutlined />}>
              시스템 역할
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => (
        <Tooltip title={description}>
          <Text type="secondary">{description}</Text>
        </Tooltip>
      ),
    },
    {
      title: '권한 수',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: any[]) => (
        <Badge count={permissions.length} showZero color="blue" />
      ),
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '작업',
      key: 'actions',
      render: (_: any, record: Role) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            disabled={record.isSystem && !isSuperAdmin}
          >
            수정
          </Button>
          <Popconfirm
            title="이 역할을 삭제하시겠습니까?"
            description="삭제된 역할은 복구할 수 없습니다."
            onConfirm={() => onDelete(record.id)}
            okText="삭제"
            cancelText="취소"
            disabled={record.isSystem && !isSuperAdmin}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={record.isSystem && !isSuperAdmin}
            >
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={Array.isArray(roles) ? roles : []}
      loading={loading}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `총 ${total}개`,
      }}
    />
  );
};
