import React, { useState } from 'react';
import { Modal, Select, Button, Descriptions, Checkbox, Space, Typography, Divider } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { AdminUser, AdminUserRole, UserApprovalRequest } from '@crypto-exchange/shared';

const { Option } = Select;
const { Text, Title } = Typography;

interface UserApprovalModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (userId: string, approvalData: UserApprovalRequest) => void;
  onReject: (userId: string) => void;
  isLoading?: boolean;
}

export const UserApprovalModal: React.FC<UserApprovalModalProps> = ({
  user,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isLoading = false,
}) => {
  const [selectedRole, setSelectedRole] = useState<AdminUserRole>(AdminUserRole.ADMIN);
  const [isActive, setIsActive] = useState(true);

  if (!isOpen || !user) return null;

  const handleApprove = () => {
    onApprove(user.id, {
      role: selectedRole,
      isActive,
    });
  };

  const handleReject = () => {
    onReject(user.id);
  };

  const handleClose = () => {
    setSelectedRole(AdminUserRole.ADMIN);
    setIsActive(true);
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          사용자 승인 처리
        </Space>
      }
      open={isOpen}
      onCancel={handleClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={isLoading}>
          취소
        </Button>,
        <Button
          key="reject"
          danger
          onClick={handleReject}
          loading={isLoading}
        >
          {isLoading ? '처리 중...' : '거부'}
        </Button>,
        <Button
          key="approve"
          type="primary"
          onClick={handleApprove}
          loading={isLoading}
        >
          {isLoading ? '처리 중...' : '승인'}
        </Button>,
      ]}
    >
      <div>
        <Text type="secondary">
          <strong>{user.firstName} {user.lastName}</strong> ({user.email}) 사용자의 가입을 처리하시겠습니까?
        </Text>
        
        <Divider />
        
        {/* 사용자 정보 */}
        <div style={{ marginBottom: '16px' }}>
          <Title level={5}>사용자 정보</Title>
          <Descriptions size="small" column={2}>
            <Descriptions.Item label="이름">
              {user.firstName} {user.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="이메일">
              {user.email}
            </Descriptions.Item>
            <Descriptions.Item label="사용자명">
              {user.username}
            </Descriptions.Item>
            <Descriptions.Item label="가입일">
              {new Date(user.createdAt).toLocaleDateString('ko-KR')}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        {/* 승인 설정 */}
        <div>
          <Space direction="vertical" style={{ width: '100%' }}>
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

            <div>
              <Checkbox
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              >
                계정 활성화
              </Checkbox>
            </div>
          </Space>
        </div>
      </div>
    </Modal>
  );
};
