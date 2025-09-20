import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Tag,
  Popconfirm,
  message,
  Typography,
  Tabs,
  Tooltip,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { Role, AdminUserRole } from '@crypto-exchange/shared';
import { usePermissionStore } from '../../application/stores/permission.store';
import { useAuthStore } from '../../application/stores/auth.store';
import { PermissionMatrix } from '../../../../shared/components/common/PermissionMatrix';
import { AuthDebugger } from '../../../../shared/components/common/AuthDebugger';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const RoleManagementPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [form] = Form.useForm();

  const {
    roles,
    rolesLoading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    clearError,
  } = usePermissionStore();

  const { user } = useAuthStore();

  // SUPER_ADMIN인지 확인
  const isSuperAdmin = user?.role === AdminUserRole.SUPER_ADMIN;

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCreateRole = async () => {
    try {
      const values = await form.validateFields();
      const { name, description } = values;
      
      // 입력값 정리 및 검증
      const cleanName = typeof name === 'string' ? name.trim() : '';
      const cleanDescription = typeof description === 'string' ? description.trim() : '';
      
      if (!cleanName) {
        message.error('역할명을 입력해주세요.');
        return;
      }
      
      if (!cleanDescription) {
        message.error('설명을 입력해주세요.');
        return;
      }
      
      const roleData = {
        name: cleanName,
        description: cleanDescription,
        isSystem: false,
      };
      
      console.log('🔍 Frontend - Form values:', values);
      console.log('🔍 Frontend - Cleaned name:', cleanName);
      console.log('🔍 Frontend - Cleaned description:', cleanDescription);
      console.log('🔍 Frontend - Role data to send:', JSON.stringify(roleData, null, 2));
      
      await createRole(roleData as any);
      
      // 역할 목록 새로고침
      await fetchRoles();
      
      message.success('역할이 성공적으로 생성되었습니다.');
      form.resetFields();
      setIsModalVisible(false);
    } catch (error: any) {
      console.error('Role creation error:', error);
      
      // 중복 이름 에러 처리
      if (error?.response?.data?.message?.includes('이미 존재합니다')) {
        message.error('이미 존재하는 역할명입니다. 다른 이름을 사용해주세요.');
      } else if (error?.response?.data?.message) {
        message.error(`역할 생성 실패: ${error.response.data.message}`);
      } else {
        message.error('역할 생성에 실패했습니다.');
      }
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;
    
    try {
      const values = await form.validateFields();
      const { name, description } = values;
      
      // 입력값 정리 및 검증
      const cleanName = typeof name === 'string' ? name.trim() : '';
      const cleanDescription = typeof description === 'string' ? description.trim() : '';
      
      if (!cleanName) {
        message.error('역할명을 입력해주세요.');
        return;
      }
      
      if (!cleanDescription) {
        message.error('설명을 입력해주세요.');
        return;
      }
      
      await updateRole(editingRole.id, {
        name: cleanName,
        description: cleanDescription,
      } as any);
      
      // 역할 목록 새로고침
      await fetchRoles();
      
      message.success('역할이 성공적으로 수정되었습니다.');
      form.resetFields();
      setIsModalVisible(false);
      setEditingRole(null);
    } catch (error: any) {
      console.error('Role update error:', error);
      
      // 중복 이름 에러 처리
      if (error?.response?.data?.message?.includes('이미 존재합니다')) {
        message.error('이미 존재하는 역할명입니다. 다른 이름을 사용해주세요.');
      } else if (error?.response?.data?.message) {
        message.error(`역할 수정 실패: ${error.response.data.message}`);
      } else {
        message.error('역할 수정에 실패했습니다.');
      }
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteRole(roleId);
      
      // 역할 목록 새로고침
      await fetchRoles();
      
      message.success('역할이 성공적으로 삭제되었습니다.');
    } catch (error) {
      message.error('역할 삭제에 실패했습니다.');
    }
  };

  const handleEditRole = (role: Role) => {
    console.log('🔍 Editing role:', role);
    console.log('🔍 Role permissions:', role.permissions);
    
    setEditingRole(role);
    
    // 권한 데이터 변환: RolePermission[] -> { resource: Resource, permissions: Permission[] }[]
    const convertedPermissions = Array.isArray(role.permissions) 
      ? role.permissions.map(rp => ({
          resource: rp.resource,
          permissions: rp.permissions
        }))
      : [];
    
    console.log('🔍 Converted permissions:', convertedPermissions);
    
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      permissions: convertedPermissions,
    });
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingRole(null);
    form.resetFields();
  };

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
            onClick={() => handleEditRole(record)}
            disabled={record.isSystem && !isSuperAdmin}
          >
            수정
          </Button>
          <Popconfirm
            title="이 역할을 삭제하시겠습니까?"
            description="삭제된 역할은 복구할 수 없습니다."
            onConfirm={() => handleDeleteRole(record.id)}
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

  const tabItems = [
    {
      key: 'list',
      label: '역할 목록',
      children: (
        <Table
          columns={columns}
          dataSource={Array.isArray(roles) ? roles : []}
          loading={rolesLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `총 ${total}개`,
          }}
        />
      ),
    },
    {
      key: 'permissions',
      label: '권한 매트릭스',
      children: (
        <PermissionMatrix
          permissions={Array.isArray(editingRole?.permissions) 
            ? editingRole.permissions.map(rp => ({
                resource: rp.resource,
                permissions: rp.permissions
              }))
            : []}
          role={editingRole?.name as any}
          onChange={(permissions) => {
            form.setFieldsValue({ permissions });
          }}
          readOnly={!editingRole}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>역할 관리</Title>
        <Text type="secondary">
          시스템의 역할과 권한을 관리합니다. 역할을 통해 사용자에게 권한을 일괄적으로 부여할 수 있습니다.
        </Text>
      </div>

      {/* 개발 환경에서만 표시 */}
      {typeof window !== 'undefined' && window.location.hostname === 'localhost' && <AuthDebugger />}

      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>역할 목록</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingRole(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              역할 생성
            </Button>
          </div>
        }
        extra={
          <Space>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setActiveTab('permissions')}
            >
              권한 매트릭스
            </Button>
          </Space>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      <Modal
        title={editingRole ? '역할 수정' : '역할 생성'}
        open={isModalVisible}
        onOk={editingRole ? handleUpdateRole : handleCreateRole}
        onCancel={handleModalClose}
        width={800}
        okText={editingRole ? '수정' : '생성'}
        cancelText="취소"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: editingRole?.name,
            description: editingRole?.description,
            permissions: Array.isArray(editingRole?.permissions) ? editingRole.permissions : [],
          }}
        >
          <Form.Item
            name="name"
            label="역할명"
            rules={[
              { required: true, message: '역할명을 입력해주세요' },
              { min: 2, max: 50, message: '역할명은 2-50자 사이여야 합니다' },
            ]}
          >
            <Input placeholder="역할명을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="description"
            label="설명"
            rules={[
              { required: true, message: '설명을 입력해주세요' },
              { max: 200, message: '설명은 200자 이하여야 합니다' },
            ]}
          >
            <TextArea
              placeholder="역할에 대한 설명을 입력하세요"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="권한 설정"
          >
            <PermissionMatrix
              permissions={Array.isArray(editingRole?.permissions) 
                ? editingRole.permissions.map(rp => ({
                    resource: rp.resource,
                    permissions: rp.permissions
                  }))
                : []}
              onChange={(permissions) => {
                form.setFieldsValue({ permissions });
              }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {error && (
        <div style={{ marginTop: 16 }}>
          <Text type="danger">{error}</Text>
          <Button size="small" onClick={clearError} style={{ marginLeft: 8 }}>
            닫기
          </Button>
        </div>
      )}
    </div>
  );
};

export default RoleManagementPage;
