import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  DatePicker,
  Space,
  Tag,
  message,
  Popconfirm,
  Typography,
  Badge,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { User, AdminUserRoleAssignment } from '@crypto-exchange/shared';
import { usePermissionStore } from '../../../features/auth/application/stores/permission.store';
import { RoleSelector } from './RoleSelector';
import dayjs from 'dayjs';

const { Text } = Typography;

interface UserPermissionManagerProps {
  user: User;
  onClose?: () => void;
}

export const UserPermissionManager: React.FC<UserPermissionManagerProps> = ({
  user,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AdminUserRoleAssignment | null>(null);
  const [form] = Form.useForm();
  
  const {
    userRoleAssignments,
    userRoleAssignmentsLoading,
    roles,
    fetchUserRoles,
    assignRoleToUser,
    removeRoleFromUser,
    error,
  } = usePermissionStore();

  useEffect(() => {
    if (user) {
      fetchUserRoles(user.id);
    }
  }, [user, fetchUserRoles]);

  const handleAssignRole = async () => {
    try {
      const values = await form.validateFields();
      const { roleId, expiresAt } = values;
      
      await assignRoleToUser(user.id, roleId, expiresAt?.format('YYYY-MM-DD'));
      message.success('역할이 성공적으로 할당되었습니다.');
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      message.error('역할 할당에 실패했습니다.');
    }
  };

  const handleRemoveRole = async (_assignmentId: string, roleId: string) => {
    try {
      await removeRoleFromUser(user.id, roleId);
      message.success('역할이 성공적으로 제거되었습니다.');
    } catch (error) {
      message.error('역할 제거에 실패했습니다.');
    }
  };

  const handleEditAssignment = (assignment: AdminUserRoleAssignment) => {
    setEditingAssignment(assignment);
    form.setFieldsValue({
      roleId: assignment.roleId,
      expiresAt: assignment.expiresAt ? dayjs(assignment.expiresAt) : undefined,
    });
    setIsModalVisible(true);
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || roleId;
  };

  const getRoleDescription = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.description || '';
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return dayjs().isAfter(dayjs(expiresAt));
  };

  const isExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return dayjs().add(7, 'days').isAfter(dayjs(expiresAt)) && !isExpired(expiresAt);
  };

  const columns = [
    {
      title: '역할',
      dataIndex: 'roleId',
      key: 'roleId',
      render: (roleId: string) => {
        const roleName = getRoleName(roleId);
        const description = getRoleDescription(roleId);
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{roleName}</div>
            {description && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {description}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: AdminUserRoleAssignment) => {
        if (isExpired(record.expiresAt)) {
          return <Tag color="red" icon={<ClockCircleOutlined />}>만료됨</Tag>;
        }
        if (isExpiringSoon(record.expiresAt)) {
          return <Tag color="orange" icon={<ClockCircleOutlined />}>만료 예정</Tag>;
        }
        return isActive ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>활성</Tag>
        ) : (
          <Tag color="default">비활성</Tag>
        );
      },
    },
    {
      title: '할당일',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '만료일',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (expiresAt: string) => {
        if (!expiresAt) return <Text type="secondary">무제한</Text>;
        const isExp = isExpired(expiresAt);
        const isExpSoon = isExpiringSoon(expiresAt);
        return (
          <Text type={isExp ? 'danger' : isExpSoon ? 'warning' : 'secondary'}>
            {dayjs(expiresAt).format('YYYY-MM-DD')}
          </Text>
        );
      },
    },
    {
      title: '작업',
      key: 'actions',
      render: (_: any, record: AdminUserRoleAssignment) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditAssignment(record)}
          >
            수정
          </Button>
          <Popconfirm
            title="이 역할을 제거하시겠습니까?"
            onConfirm={() => handleRemoveRole(record.id, record.roleId)}
            okText="제거"
            cancelText="취소"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              제거
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserOutlined style={{ marginRight: 8 }} />
          <span>{user.firstName} {user.lastName}의 권한 관리</span>
          <Badge 
            count={userRoleAssignments.length} 
            style={{ marginLeft: 8 }}
            showZero
          />
        </div>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingAssignment(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          역할 할당
        </Button>
      }
      style={{ marginBottom: 16 }}
    >
      <Table
        columns={columns}
        dataSource={userRoleAssignments}
        loading={userRoleAssignmentsLoading}
        rowKey="id"
        pagination={false}
        size="small"
      />

      <Modal
        title={editingAssignment ? '역할 수정' : '역할 할당'}
        open={isModalVisible}
        onOk={handleAssignRole}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            roleId: editingAssignment?.roleId,
            expiresAt: editingAssignment?.expiresAt ? dayjs(editingAssignment.expiresAt) : undefined,
          }}
        >
          <Form.Item
            name="roleId"
            label="역할"
            rules={[{ required: true, message: '역할을 선택해주세요' }]}
          >
            <RoleSelector
              placeholder="역할을 선택하세요"
              showRoleDescription
            />
          </Form.Item>
          
          <Form.Item
            name="expiresAt"
            label="만료일 (선택사항)"
            help="만료일을 설정하지 않으면 무제한으로 유지됩니다"
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="만료일을 선택하세요"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
        </Form>
      </Modal>

      {error && (
        <div style={{ marginTop: 16 }}>
          <Text type="danger">{error}</Text>
        </div>
      )}
    </Card>
  );
};

export default UserPermissionManager;
