import React, { useState } from 'react';
import { Modal, Select, Button, List, Typography, Space, Divider } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { AdminUser, AdminUserRole, UserBulkAction } from '@crypto-exchange/shared';

const { Option } = Select;
const { Text, Title } = Typography;

interface BulkActionModalProps {
  selectedUsers: AdminUser[];
  selectedAdminUsers?: AdminUser[];
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: UserBulkAction) => void;
  isLoading?: boolean;
}

export const BulkActionModal: React.FC<BulkActionModalProps> = ({
  selectedUsers,
  selectedAdminUsers,
  isOpen,
  onClose,
  onAction,
  isLoading = false,
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | 'suspend' | 'activate' | 'deactivate'>('approve');
  const [selectedRole, setSelectedRole] = useState<AdminUserRole>(AdminUserRole.ADMIN);

  if (!isOpen) return null;

  const handleAction = () => {
    const currentSelected = selectedAdminUsers && selectedAdminUsers.length > 0 ? selectedAdminUsers : selectedUsers;
    const actionData: UserBulkAction = {
      userIds: currentSelected.map(user => user.id),
      action,
      ...(action === 'approve' && { role: selectedRole }),
    };
    onAction(actionData);
  };

  const getActionTitle = () => {
    switch (action) {
      case 'approve':
        return '사용자 승인';
      case 'reject':
        return '사용자 거부';
      case 'suspend':
        return '사용자 정지';
      case 'activate':
        return '사용자 활성화';
      case 'deactivate':
        return '사용자 비활성화';
      default:
        return '대량 작업';
    }
  };

  const getActionDescription = () => {
    const currentSelected = selectedAdminUsers && selectedAdminUsers.length > 0 ? selectedAdminUsers : selectedUsers;
    switch (action) {
      case 'approve':
        return `${currentSelected.length}명의 어드민 사용자를 승인하시겠습니까?`;
      case 'reject':
        return `${currentSelected.length}명의 어드민 사용자를 거부하시겠습니까?`;
      case 'suspend':
        return `${currentSelected.length}명의 어드민 사용자를 정지하시겠습니까?`;
      case 'activate':
        return `${currentSelected.length}명의 어드민 사용자를 활성화하시겠습니까?`;
      case 'deactivate':
        return `${currentSelected.length}명의 어드민 사용자를 비활성화하시겠습니까?`;
      default:
        return '';
    }
  };

  const getActionButtonType = () => {
    switch (action) {
      case 'approve':
        return 'primary';
      case 'reject':
      case 'suspend':
      case 'deactivate':
        return 'primary';
      case 'activate':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getActionButtonDanger = () => {
    return action === 'reject' || action === 'suspend' || action === 'deactivate';
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
          {getActionTitle()}
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={isLoading}>
          취소
        </Button>,
        <Button
          key="action"
          type={getActionButtonType()}
          danger={getActionButtonDanger()}
          onClick={handleAction}
          loading={isLoading}
        >
          {isLoading ? '처리 중...' : '실행'}
        </Button>,
      ]}
    >
      <div>
        <Text type="secondary">{getActionDescription()}</Text>
        
        <Divider />
        
        {/* 선택된 어드민 사용자 목록 */}
        <div style={{ marginBottom: '16px' }}>
          <Title level={5}>선택된 어드민 사용자 ({(selectedAdminUsers && selectedAdminUsers.length > 0 ? selectedAdminUsers : selectedUsers).length}명)</Title>
          <List
            size="small"
            dataSource={selectedAdminUsers && selectedAdminUsers.length > 0 ? selectedAdminUsers : selectedUsers}
            renderItem={(user) => (
              <List.Item>
                <List.Item.Meta
                  title={`${user.firstName} ${user.lastName}`}
                  description={user.email}
                />
              </List.Item>
            )}
            style={{ 
              maxHeight: '200px', 
              overflowY: 'auto',
              backgroundColor: '#f5f5f5',
              padding: '8px',
              borderRadius: '6px'
            }}
          />
        </div>

        <Divider />

        {/* 작업 선택 */}
        <div style={{ marginBottom: '16px' }}>
          <Text strong>수행할 작업</Text>
          <Select
            value={action}
            onChange={(value) => setAction(value as any)}
            style={{ width: '100%', marginTop: '8px' }}
          >
            <Option value="approve">승인</Option>
            <Option value="reject">거부</Option>
            <Option value="suspend">정지</Option>
            <Option value="activate">활성화</Option>
            <Option value="deactivate">비활성화</Option>
          </Select>
        </div>

        {/* 역할 선택 (승인 작업일 때만) */}
        {action === 'approve' && (
          <div>
            <Text strong>부여할 역할</Text>
            <Select
              value={selectedRole}
              onChange={(value) => setSelectedRole(value as AdminUserRole)}
              style={{ width: '100%', marginTop: '8px' }}
            >
              <Option value={AdminUserRole.ADMIN}>관리자</Option>
              <Option value={AdminUserRole.MODERATOR}>모더레이터</Option>
              <Option value={AdminUserRole.SUPPORT}>지원팀</Option>
              <Option value={AdminUserRole.AUDITOR}>감사자</Option>
            </Select>
          </div>
        )}
      </div>
    </Modal>
  );
};
