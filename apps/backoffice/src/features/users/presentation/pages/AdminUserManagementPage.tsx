import React, {useState} from 'react';
import {Alert, Button, Card, Space, Tabs} from 'antd';
import {ReloadOutlined, SettingOutlined} from '@ant-design/icons';
import {AdminUser, UserApprovalRequest, UserBulkAction, UserStatus} from '@crypto-exchange/shared';
import {UserTable} from '../components/UserTable';
import {UserFilters} from '../components/UserFilters';
import {UserStatsCards} from '../components/UserStatsCards';
import {UserApprovalModal} from '../components/UserApprovalModal';
import {BulkActionModal} from '../components/BulkActionModal';
import {
  useBulkUserAction,
  usePendingUsers,
  useUserApproval,
  useUserFilters,
  useUserRejection,
  useUsers,
  useUsersByStatus,
  useUserStats
} from '../../application/hooks/useUsers';
import {useUserSelectors, useUserStore} from '../../application/stores/user.store';
import {LoadingSpinner} from '@/shared/components/common/LoadingSpinner';

const { TabPane } = Tabs;

interface UserManagementTabProps {
  users: AdminUser[];
  isLoading: boolean;
  error: any;
  onUserApprove?: (userId: string) => void;
  onUserReject?: (userId: string) => void;
  onUserEdit: (userId: string) => void;
  onUserDelete: (userId: string) => void;
  showActions?: boolean;
  showSelection?: boolean;
  selectedUsers?: string[];
  onSelectionChange?: (selectedUsers: string[]) => void;
  title: string;
  emptyMessage: string;
  emptyIcon?: React.ReactNode;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  isLoading,
  error,
  onUserApprove,
  onUserReject,
  onUserEdit,
  onUserDelete,
  showActions = false,
  showSelection = false,
  selectedUsers = [],
  onSelectionChange,
  title,
  emptyMessage,
  emptyIcon
}) => {
  if (error) {
    return (
      <Alert
        message="오류가 발생했습니다"
        description="사용자 데이터를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해주세요."
        type="error"
        showIcon
        action={
          <Button size="small" onClick={() => window.location.reload()}>
            새로고침
          </Button>
        }
      />
    );
  }

  return (
    <Card>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 500,
          color: '#262626',
          margin: 0
        }}>
          {title}
          {users && (
            <span style={{
              marginLeft: '8px',
              fontSize: '14px',
              fontWeight: 400,
              color: '#8c8c8c'
            }}>
              ({users.length}명)
            </span>
          )}
        </h3>
        {selectedUsers.length > 0 && (
          <Space>
            <span style={{
              fontSize: '14px',
              color: '#8c8c8c'
            }}>
              {selectedUsers.length}명 선택됨
            </span>
            <Button
              type="link"
              onClick={() => onSelectionChange?.([])}
              style={{ padding: 0 }}
            >
              선택 해제
            </Button>
          </Space>
        )}
      </div>

      {isLoading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '256px'
        }}>
          <LoadingSpinner />
        </div>
      ) : users && users.length > 0 ? (
        <UserTable
          users={users}
          onUserApprove={onUserApprove}
          onUserReject={onUserReject}
          onUserEdit={onUserEdit}
          onUserDelete={onUserDelete}
          selectedUsers={selectedUsers}
          onSelectionChange={onSelectionChange}
          showActions={showActions}
          showSelection={showSelection}
        />
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '48px 0'
        }}>
          <div style={{
            fontSize: '48px',
            color: '#d9d9d9',
            marginBottom: '16px'
          }}>
            {emptyIcon}
          </div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 500,
            color: '#262626',
            margin: '0 0 8px 0'
          }}>
            {emptyMessage}
          </h3>
        </div>
      )}
    </Card>
  );
};

export const AdminUserManagementPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const { filters, updateFilter, resetFilters } = useUserFilters();
  const { data: allUsers, isLoading: allUsersLoading, error: allUsersError } = useUsers(filters);
  const { data: pendingUsers, isLoading: pendingUsersLoading, error: pendingUsersError } = usePendingUsers();
  const { data: approvedUsers, isLoading: approvedUsersLoading, error: approvedUsersError } = useUsersByStatus(UserStatus.APPROVED);
  const { data: rejectedUsers, isLoading: rejectedUsersLoading, error: rejectedUsersError } = useUsersByStatus(UserStatus.REJECTED);
  const { data: suspendedUsers, isLoading: suspendedUsersLoading, error: suspendedUsersError } = useUsersByStatus(UserStatus.SUSPENDED);
  const { data: stats, isLoading: statsLoading } = useUserStats();

  const approvalMutation = useUserApproval();
  const rejectionMutation = useUserRejection();
  const bulkActionMutation = useBulkUserAction();

  const {
    selectedUsers,
    selectedUserObjects,
  } = useUserSelectors();

  const { setSelectedUsers, clearSelection } = useUserStore();

  const handleUserApprove = (userId: string) => {
    const user = allUsers?.find(u => u.id === userId) ||
                 pendingUsers?.find(u => u.id === userId) ||
                 approvedUsers?.find(u => u.id === userId) ||
                 rejectedUsers?.find(u => u.id === userId) ||
                 suspendedUsers?.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsApprovalModalOpen(true);
    }
  };

  const handleUserReject = (userId: string) => {
    const user = allUsers?.find(u => u.id === userId) ||
                 pendingUsers?.find(u => u.id === userId) ||
                 approvedUsers?.find(u => u.id === userId) ||
                 rejectedUsers?.find(u => u.id === userId) ||
                 suspendedUsers?.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsApprovalModalOpen(true);
    }
  };

  const handleApproval = (userId: string, approvalData: UserApprovalRequest) => {
    approvalMutation.mutate(
      { userId, approvalData },
      {
        onSuccess: () => {
          setIsApprovalModalOpen(false);
          setSelectedUser(null);
        },
      }
    );
  };

  const handleRejection = (userId: string) => {
    rejectionMutation.mutate(userId, {
      onSuccess: () => {
        setIsApprovalModalOpen(false);
        setSelectedUser(null);
      },
    });
  };

  const handleBulkAction = (actionData: UserBulkAction) => {
    bulkActionMutation.mutate(actionData, {
      onSuccess: () => {
        setIsBulkActionModalOpen(false);
        clearSelection();
      },
    });
  };

  const handleUserEdit = (userId: string) => {
    // TODO: 사용자 수정 모달 또는 페이지로 이동
    console.log('Edit user:', userId);
  };

  const handleUserDelete = (userId: string) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      // TODO: 사용자 삭제 API 호출
      console.log('Delete user:', userId);
    }
  };

  const handleBulkActionClick = () => {
    if (selectedUsers.length === 0) {
      alert('작업할 사용자를 선택해주세요.');
      return;
    }
    setIsBulkActionModalOpen(true);
  };

  const isLoading = allUsersLoading || approvalMutation.isPending || rejectionMutation.isPending || bulkActionMutation.isPending;

  const getCurrentUsers = () => {
    switch (activeTab) {
      case 'all':
        return allUsers || [];
      case 'pending':
        return pendingUsers || [];
      case 'approved':
        return approvedUsers || [];
      case 'rejected':
        return rejectedUsers || [];
      case 'suspended':
        return suspendedUsers || [];
      default:
        return [];
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'all':
        return allUsersLoading;
      case 'pending':
        return pendingUsersLoading;
      case 'approved':
        return approvedUsersLoading;
      case 'rejected':
        return rejectedUsersLoading;
      case 'suspended':
        return suspendedUsersLoading;
      default:
        return false;
    }
  };

  const getCurrentError = () => {
    switch (activeTab) {
      case 'all':
        return allUsersError;
      case 'pending':
        return pendingUsersError;
      case 'approved':
        return approvedUsersError;
      case 'rejected':
        return rejectedUsersError;
      case 'suspended':
        return suspendedUsersError;
      default:
        return null;
    }
  };

  const getTabConfig = () => {
    const configs = {
      all: {
        title: '전체 어드민 사용자',
        emptyMessage: '어드민 사용자가 없습니다',
        emptyIcon: <span>👥</span>,
        showActions: true,
        showSelection: true,
        onUserApprove: handleUserApprove,
        onUserReject: handleUserReject,
      },
      pending: {
        title: '승인 대기 어드민 사용자',
        emptyMessage: '승인 대기 어드민 사용자가 없습니다',
        emptyIcon: <span>⏳</span>,
        showActions: true,
        showSelection: false,
        onUserApprove: handleUserApprove,
        onUserReject: handleUserReject,
      },
      approved: {
        title: '승인된 어드민 사용자',
        emptyMessage: '승인된 어드민 사용자가 없습니다',
        emptyIcon: <span>✅</span>,
        showActions: false,
        showSelection: false,
        onUserApprove: undefined,
        onUserReject: undefined,
      },
      rejected: {
        title: '거부된 어드민 사용자',
        emptyMessage: '거부된 어드민 사용자가 없습니다',
        emptyIcon: <span>❌</span>,
        showActions: false,
        showSelection: false,
        onUserApprove: undefined,
        onUserReject: undefined,
      },
      suspended: {
        title: '정지된 어드민 사용자',
        emptyMessage: '정지된 어드민 사용자가 없습니다',
        emptyIcon: <span>⛔</span>,
        showActions: false,
        showSelection: false,
        onUserApprove: undefined,
        onUserReject: undefined,
      },
    };
    return configs[activeTab as keyof typeof configs];
  };

  const tabConfig = getTabConfig();

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: '#262626', 
              margin: 0,
              lineHeight: 1.2
            }}>
              어드민 사용자 관리
            </h2>
            <p style={{ 
              marginTop: '8px', 
              fontSize: '14px', 
              color: '#8c8c8c',
              margin: 0
            }}>
              어드민 사용자 가입 승인 및 상태 관리를 수행할 수 있습니다.
            </p>
          </div>
          <Space>
            {selectedUsers.length > 0 && (
              <Button
                type="primary"
                onClick={handleBulkActionClick}
                icon={<SettingOutlined />}
              >
                대량 작업 ({selectedUsers.length})
              </Button>
            )}
            <Button
              onClick={() => window.location.reload()}
              icon={<ReloadOutlined />}
            >
              새로고침
            </Button>
          </Space>
        </div>

        {/* 통계 카드 */}
        <div style={{ marginBottom: '32px' }}>
          <UserStatsCards stats={stats || {
            totalUsers: 0,
            activeUsers: 0,
            pendingUsers: 0,
            approvedUsers: 0,
            rejectedUsers: 0,
            suspendedUsers: 0,
            todayRegistrations: 0,
            weeklyRegistrations: 0,
            monthlyRegistrations: 0,
            roleStats: {},
          }} isLoading={statsLoading} />
        </div>

        {/* 필터 */}
        <UserFilters
          filters={filters}
          onFiltersChange={updateFilter}
          onReset={resetFilters}
        />

        {/* 탭 기반 사용자 관리 */}
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'all',
                label: '전체 어드민 사용자',
                children: (
                  <UserManagementTab
                    users={getCurrentUsers()}
                    isLoading={getCurrentLoading()}
                    error={getCurrentError()}
                    onUserApprove={tabConfig.onUserApprove}
                    onUserReject={tabConfig.onUserReject}
                    onUserEdit={handleUserEdit}
                    onUserDelete={handleUserDelete}
                    showActions={tabConfig.showActions}
                    showSelection={tabConfig.showSelection}
                    selectedUsers={selectedUsers}
                    onSelectionChange={setSelectedUsers}
                    title={tabConfig.title}
                    emptyMessage={tabConfig.emptyMessage}
                    emptyIcon={tabConfig.emptyIcon}
                  />
                ),
              },
              {
                key: 'pending',
                label: '승인 대기',
                children: (
                  <UserManagementTab
                    users={getCurrentUsers()}
                    isLoading={getCurrentLoading()}
                    error={getCurrentError()}
                    onUserApprove={tabConfig.onUserApprove}
                    onUserReject={tabConfig.onUserReject}
                    onUserEdit={handleUserEdit}
                    onUserDelete={handleUserDelete}
                    showActions={tabConfig.showActions}
                    showSelection={tabConfig.showSelection}
                    selectedUsers={selectedUsers}
                    onSelectionChange={setSelectedUsers}
                    title={tabConfig.title}
                    emptyMessage={tabConfig.emptyMessage}
                    emptyIcon={tabConfig.emptyIcon}
                  />
                ),
              },
              {
                key: 'approved',
                label: '승인됨',
                children: (
                  <UserManagementTab
                    users={getCurrentUsers()}
                    isLoading={getCurrentLoading()}
                    error={getCurrentError()}
                    onUserApprove={tabConfig.onUserApprove}
                    onUserReject={tabConfig.onUserReject}
                    onUserEdit={handleUserEdit}
                    onUserDelete={handleUserDelete}
                    showActions={tabConfig.showActions}
                    showSelection={tabConfig.showSelection}
                    selectedUsers={selectedUsers}
                    onSelectionChange={setSelectedUsers}
                    title={tabConfig.title}
                    emptyMessage={tabConfig.emptyMessage}
                    emptyIcon={tabConfig.emptyIcon}
                  />
                ),
              },
              {
                key: 'rejected',
                label: '거부됨',
                children: (
                  <UserManagementTab
                    users={getCurrentUsers()}
                    isLoading={getCurrentLoading()}
                    error={getCurrentError()}
                    onUserApprove={tabConfig.onUserApprove}
                    onUserReject={tabConfig.onUserReject}
                    onUserEdit={handleUserEdit}
                    onUserDelete={handleUserDelete}
                    showActions={tabConfig.showActions}
                    showSelection={tabConfig.showSelection}
                    selectedUsers={selectedUsers}
                    onSelectionChange={setSelectedUsers}
                    title={tabConfig.title}
                    emptyMessage={tabConfig.emptyMessage}
                    emptyIcon={tabConfig.emptyIcon}
                  />
                ),
              },
              {
                key: 'suspended',
                label: '정지됨',
                children: (
                  <UserManagementTab
                    users={getCurrentUsers()}
                    isLoading={getCurrentLoading()}
                    error={getCurrentError()}
                    onUserApprove={tabConfig.onUserApprove}
                    onUserReject={tabConfig.onUserReject}
                    onUserEdit={handleUserEdit}
                    onUserDelete={handleUserDelete}
                    showActions={tabConfig.showActions}
                    showSelection={tabConfig.showSelection}
                    selectedUsers={selectedUsers}
                    onSelectionChange={setSelectedUsers}
                    title={tabConfig.title}
                    emptyMessage={tabConfig.emptyMessage}
                    emptyIcon={tabConfig.emptyIcon}
                  />
                ),
              },
            ]}
          />
        </Card>

        {/* 승인 모달 */}
        <UserApprovalModal
          user={selectedUser}
          isOpen={isApprovalModalOpen}
          onClose={() => {
            setIsApprovalModalOpen(false);
            setSelectedUser(null);
          }}
          onApprove={handleApproval}
          onReject={handleRejection}
          isLoading={approvalMutation.isPending || rejectionMutation.isPending}
        />

        {/* 대량 작업 모달 */}
        <BulkActionModal
          selectedUsers={selectedUserObjects}
          isOpen={isBulkActionModalOpen}
          onClose={() => setIsBulkActionModalOpen(false)}
          onAction={handleBulkAction}
          isLoading={bulkActionMutation.isPending}
        />
      </div>
    </div>
  );
};
