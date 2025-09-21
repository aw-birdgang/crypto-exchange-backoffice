import React, { useState } from 'react';
import { Table, Checkbox, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { AdminUser, UserStatus, AdminUserRole } from '@crypto-exchange/shared';
import { UserStatusBadge } from './UserStatusBadge';
import { UserRoleBadge } from './UserRoleBadge';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';

interface UserTableProps {
  users: AdminUser[];
  isLoading?: boolean;
  onUserSelect?: (userId: string) => void;
  onUserApprove?: (userId: string) => void;
  onUserReject?: (userId: string) => void;
  onUserEdit?: (userId: string) => void;
  onUserDelete?: (userId: string) => void;
  selectedUsers?: string[];
  selectedAdminUsers?: string[];
  onSelectionChange?: (userIds: string[]) => void;
  showActions?: boolean;
  showSelection?: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading = false,
  onUserSelect,
  onUserApprove,
  onUserReject,
  onUserEdit,
  onUserDelete,
  selectedUsers = [],
  selectedAdminUsers = [],
  onSelectionChange,
  showActions = true,
  showSelection = true,
}) => {
  const [sortField, setSortField] = useState<keyof AdminUser>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof AdminUser) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(users.map(user => user.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const currentSelected = selectedAdminUsers.length > 0 ? selectedAdminUsers : selectedUsers;
    if (checked) {
      onSelectionChange?.([...currentSelected, userId]);
    } else {
      onSelectionChange?.(currentSelected.filter(id => id !== userId));
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns: ColumnsType<AdminUser> = [
    ...(showSelection ? [{
      key: 'select',
      title: (
        <Checkbox
          checked={(selectedAdminUsers.length > 0 ? selectedAdminUsers : selectedUsers).length === users.length && users.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      width: 50,
      render: (_: any, user: AdminUser) => (
        <Checkbox
          checked={(selectedAdminUsers.length > 0 ? selectedAdminUsers : selectedUsers).includes(user.id)}
          onChange={(e) => handleSelectUser(user.id, e.target.checked)}
        />
      ),
    }] : []),
    {
      key: 'email',
      title: '이메일',
      sorter: (a, b) => a.email.localeCompare(b.email),
      render: (_: any, user: AdminUser) => (
        <div>
          <div style={{ fontWeight: 500, color: '#262626' }}>{user.email}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>@{user.username}</div>
        </div>
      ),
    },
    {
      key: 'name',
      title: '이름',
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
      render: (_: any, user: AdminUser) => (
        <div>
          <div style={{ fontWeight: 500, color: '#262626' }}>
            {user.firstName} {user.lastName}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      title: '상태',
      render: (_, user: AdminUser) => <UserStatusBadge status={user.status} />,
    },
    {
      key: 'role',
      title: '역할',
      render: (_, user: AdminUser) => <UserRoleBadge role={user.adminRole} />,
    },
    {
      key: 'isActive',
      title: '활성',
      render: (_: any, user: AdminUser) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 500,
            backgroundColor: user.isActive ? '#f6ffed' : '#fff2f0',
            color: user.isActive ? '#52c41a' : '#ff4d4f',
            border: `1px solid ${user.isActive ? '#b7eb8f' : '#ffccc7'}`,
          }}
        >
          {user.isActive ? '활성' : '비활성'}
        </span>
      ),
    },
    {
      key: 'lastLoginAt',
      title: '마지막 로그인',
      render: (_: any, user: AdminUser) => (
        <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
          {user.lastLoginAt ? formatDate(user.lastLoginAt) : '없음'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: '가입일',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (_: any, user: AdminUser) => (
        <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
          {formatDate(user.createdAt)}
        </span>
      ),
    },
    ...(showActions ? [{
      key: 'actions',
      title: '작업',
      width: 200,
      render: (_: any, user: AdminUser) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {user.status === UserStatus.PENDING && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => onUserApprove?.(user.id)}
                style={{ color: '#52c41a', padding: 0 }}
              >
                승인
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => onUserReject?.(user.id)}
                style={{ color: '#ff4d4f', padding: 0 }}
              >
                거부
              </Button>
            </>
          )}
          <Button
            type="link"
            size="small"
            onClick={() => onUserEdit?.(user.id)}
            style={{ color: '#1890ff', padding: 0 }}
          >
            수정
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => onUserDelete?.(user.id)}
            style={{ padding: 0 }}
          >
            삭제
          </Button>
        </div>
      ),
    }] : []),
  ];

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '256px' 
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#fff', 
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <Table
        dataSource={users}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: 1,
          pageSize: 10,
          total: users.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} items`,
          onChange: () => {},
        }}
        scroll={{ x: 800 }}
        size="middle"
      />
    </div>
  );
};
