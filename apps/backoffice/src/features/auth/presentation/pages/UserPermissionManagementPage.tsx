import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Typography,
  Tabs,
  Select,
  Avatar,
  message,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { User, UserRole, UserRoleAssignment } from '@crypto-exchange/shared';
import { usePermissionStore } from '../../application/stores/permission.store';
// import { useUserStore } from '../../../users/application/stores/user.store';
import { UserPermissionManager } from '../../../../shared/components/common/UserPermissionManager';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

export const UserPermissionManagementPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('users');

  // 임시 사용자 데이터 (실제로는 API에서 가져와야 함)
  const users: User[] = [];
  const usersLoading = false;
  const usersError = null;
  const fetchAllUsers = () => {};
  const clearError = () => {};

  const {
    userRoleAssignments,
    userRoleAssignmentsLoading,
    roles,
    error: permissionError,
  } = usePermissionStore();

  // 컴포넌트 마운트 시 사용자 데이터 로드 (일반 사용자 + 관리자 통합)
  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // 에러 처리
  useEffect(() => {
    if (usersError) {
      message.error(usersError);
      clearError();
    }
  }, [usersError, clearError]);

  useEffect(() => {
    if (permissionError) {
      message.error(permissionError);
    }
  }, [permissionError]);

  const roleLabels: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: '최고 관리자',
    [UserRole.ADMIN]: '관리자',
    [UserRole.USER]: '사용자',
  };

  const roleColors: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'red',
    [UserRole.ADMIN]: 'blue',
    [UserRole.USER]: 'default',
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchText || 
      user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const userColumns = [
    {
      title: '사용자',
      dataIndex: 'firstName',
      key: 'user',
      render: (firstName: string, record: User) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            style={{
              backgroundColor: roleColors[record.role],
              marginRight: 12,
            }}
          >
            {firstName[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>
              {firstName} {record.lastName}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '역할',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={roleColors[role]}>
          {roleLabels[role]}
        </Tag>
      ),
    },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '활성' : '비활성'}
        </Tag>
      ),
    },
    {
      title: '가입일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '작업',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => setSelectedUser(record)}
          >
            권한 관리
          </Button>
        </Space>
      ),
    },
  ];

  const assignmentColumns = [
    {
      title: '사용자',
      dataIndex: 'userId',
      key: 'user',
      render: (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return <Text type="secondary">알 수 없음</Text>;
        
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              size="small"
              style={{
                backgroundColor: roleColors[user.role],
                marginRight: 8,
              }}
            >
              {user.firstName[0]}
            </Avatar>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>
                {user.firstName} {user.lastName}
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {user.email}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: '역할',
      dataIndex: 'roleId',
      key: 'role',
      render: (roleId: string) => {
        const role = roles.find(r => r.id === roleId);
        return (
          <Tag color="blue">
            {role?.name || roleId}
          </Tag>
        );
      },
    },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: UserRoleAssignment) => {
        const isExpired = record.expiresAt && dayjs().isAfter(dayjs(record.expiresAt));
        if (isExpired) {
          return <Tag color="red">만료됨</Tag>;
        }
        return isActive ? (
          <Tag color="green">활성</Tag>
        ) : (
          <Tag color="default">비활성</Tag>
        );
      },
    },
    {
      title: '할당일',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '만료일',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (expiresAt: string) => {
        if (!expiresAt) return <Text type="secondary">무제한</Text>;
        return dayjs(expiresAt).format('YYYY-MM-DD');
      },
    },
  ];

  const tabItems = [
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          사용자 목록
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
            <Search
              placeholder="사용자 검색"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="역할 필터"
              value={roleFilter}
              onChange={setRoleFilter}
              style={{ width: 150 }}
              allowClear
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="상태 필터"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="active">활성</Select.Option>
              <Select.Option value="inactive">비활성</Select.Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchText('');
                setRoleFilter(undefined);
                setStatusFilter(undefined);
                fetchAllUsers(); // 사용자 데이터 새로고침 (일반 사용자 + 관리자)
              }}
              loading={usersLoading}
            >
              새로고침
            </Button>
          </div>
          
          <Table
            columns={userColumns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={usersLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `총 ${total}명`,
            }}
          />
        </div>
      ),
    },
    {
      key: 'assignments',
      label: (
        <span>
          <TeamOutlined />
          역할 할당 현황
        </span>
      ),
      children: (
        <Table
          columns={assignmentColumns}
          dataSource={userRoleAssignments}
          loading={userRoleAssignmentsLoading}
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
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>사용자 권한 관리</Title>
        <Text type="secondary">
          사용자별 권한과 역할을 관리합니다. 사용자에게 역할을 할당하여 권한을 부여할 수 있습니다.
        </Text>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      {selectedUser && (
        <UserPermissionManager
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {(usersError || permissionError) && (
        <div style={{ marginTop: 16 }}>
          <Text type="danger">{usersError || permissionError}</Text>
        </div>
      )}
    </div>
  );
};

export default UserPermissionManagementPage;
