import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  message,
  Typography,
  Tabs,
  Form,
} from 'antd';
import { Role, AdminUserRole } from '@crypto-exchange/shared';
import { usePermissionStore } from '../../application/stores/permission.store';
import { useAuthStore } from '../../application/stores/auth.store';
import { PermissionMatrix } from '../../../../shared/components/common/PermissionMatrix';
import { AuthDebugger } from '../../../../shared/components/common/AuthDebugger';
import { RoleTable } from '../components/RoleTable';
import { RoleModal } from '../components/RoleModal';
import { RoleActions } from '../components/RoleActions';

const { Title, Text } = Typography;

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

  const handlePermissionsChange = (permissions: any[]) => {
    form.setFieldsValue({ permissions });
  };

  const tabItems = [
    {
      key: 'list',
      label: '역할 목록',
      children: (
        <RoleTable
          roles={roles || []}
          loading={rolesLoading}
          isSuperAdmin={isSuperAdmin}
          onEdit={handleEditRole}
          onDelete={handleDeleteRole}
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
        title="역할 목록"
        extra={
          <RoleActions
            onCreateRole={() => {
              setEditingRole(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
            onShowPermissions={() => setActiveTab('permissions')}
          />
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      <RoleModal
        isVisible={isModalVisible}
        editingRole={editingRole}
        onOk={editingRole ? handleUpdateRole : handleCreateRole}
        onCancel={handleModalClose}
        form={form}
        onPermissionsChange={handlePermissionsChange}
      />

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
