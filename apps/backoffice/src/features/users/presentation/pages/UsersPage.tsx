import React from 'react';
import { Typography, Card, Button, Space, message } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { PermissionGate } from '../../../../shared/components/common/PermissionGate';
import { Resource, Permission } from '@crypto-exchange/shared';

const { Title, Text } = Typography;

export const UsersPage: React.FC = () => {
  const handleCreateUser = () => {
    message.info('사용자 생성 기능 (구현 예정)');
  };

  const handleEditUser = () => {
    message.info('사용자 수정 기능 (구현 예정)');
  };

  const handleDeleteUser = () => {
    message.info('사용자 삭제 기능 (구현 예정)');
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <UserOutlined /> 사용자 관리
        </Title>
        <Text type="secondary">
          등록된 사용자들을 관리하고 모니터링하세요.
        </Text>
      </div>

      <Card
        title="사용자 목록"
        extra={
          <PermissionGate resource={Resource.USERS} permission={Permission.CREATE}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateUser}>
              사용자 추가
            </Button>
          </PermissionGate>
        }
      >
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <UserOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <div>
            <Text type="secondary">사용자 목록이 여기에 표시됩니다.</Text>
          </div>
          <div style={{ marginTop: '16px' }}>
            <Space>
              <PermissionGate resource={Resource.USERS} permission={Permission.READ}>
                <Button icon={<UserOutlined />}>사용자 조회</Button>
              </PermissionGate>
              <PermissionGate resource={Resource.USERS} permission={Permission.UPDATE}>
                <Button icon={<EditOutlined />} onClick={handleEditUser}>
                  사용자 수정
                </Button>
              </PermissionGate>
              <PermissionGate resource={Resource.USERS} permission={Permission.DELETE}>
                <Button icon={<DeleteOutlined />} danger onClick={handleDeleteUser}>
                  사용자 삭제
                </Button>
              </PermissionGate>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
};
