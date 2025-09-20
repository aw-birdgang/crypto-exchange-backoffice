import React from 'react';
import { Input, Select, Button, Row, Col, Card } from 'antd';
import { UserStatus, AdminUserRole } from '@crypto-exchange/shared';
import { UserFilters as UserFiltersType } from '@crypto-exchange/shared';

const { Option } = Select;

interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (filters: Partial<UserFiltersType>) => void;
  onReset: () => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const handleStatusChange = (status: UserStatus | '') => {
    onFiltersChange({ 
      status: status === '' ? undefined : status as UserStatus,
      page: 1 
    });
  };

  const handleRoleChange = (role: AdminUserRole | '') => {
    onFiltersChange({ 
      role: role === '' ? undefined : role as AdminUserRole,
      page: 1 
    });
  };

  const handleActiveChange = (isActive: boolean | '') => {
    onFiltersChange({ 
      isActive: isActive === '' ? undefined : isActive,
      page: 1 
    });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({ 
      search: search || undefined,
      page: 1 
    });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ 
      sortBy: sortBy as UserFiltersType['sortBy'],
      page: 1 
    });
  };

  const handleSortOrderChange = (sortOrder: string) => {
    onFiltersChange({ 
      sortOrder: sortOrder as UserFiltersType['sortOrder'],
      page: 1 
    });
  };

  const handleLimitChange = (limit: number) => {
    onFiltersChange({ 
      limit,
      page: 1 
    });
  };

  return (
    <Card title="필터" style={{ marginBottom: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* 검색 */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: 500, 
              color: '#262626', 
              marginBottom: '4px' 
            }}>
              검색
            </label>
            <Input
              placeholder="이메일, 이름으로 검색..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </Col>

        {/* 상태 필터 */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: 500, 
              color: '#262626', 
              marginBottom: '4px' 
            }}>
              상태
            </label>
            <Select
              value={filters.status || undefined}
              onChange={handleStatusChange}
              placeholder="전체"
              style={{ width: '100%' }}
            >
              <Option value={UserStatus.PENDING}>대기중</Option>
              <Option value={UserStatus.APPROVED}>승인됨</Option>
              <Option value={UserStatus.REJECTED}>거부됨</Option>
              <Option value={UserStatus.SUSPENDED}>정지됨</Option>
            </Select>
          </div>
        </Col>

        {/* 역할 필터 */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: 500, 
              color: '#262626', 
              marginBottom: '4px' 
            }}>
              역할
            </label>
            <Select
              value={filters.role || undefined}
              onChange={handleRoleChange}
              placeholder="전체"
              style={{ width: '100%' }}
            >
              <Option value={AdminUserRole.SUPER_ADMIN}>최고관리자</Option>
              <Option value={AdminUserRole.ADMIN}>관리자</Option>
              <Option value={AdminUserRole.MODERATOR}>모더레이터</Option>
              <Option value={AdminUserRole.SUPPORT}>지원팀</Option>
              <Option value={AdminUserRole.AUDITOR}>감사자</Option>
            </Select>
          </div>
        </Col>

        {/* 활성 상태 필터 */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: 500, 
              color: '#262626', 
              marginBottom: '4px' 
            }}>
              활성 상태
            </label>
            <Select
              value={filters.isActive === undefined ? undefined : filters.isActive}
              onChange={handleActiveChange}
              placeholder="전체"
              style={{ width: '100%' }}
            >
              <Option value={true}>활성</Option>
              <Option value={false}>비활성</Option>
            </Select>
          </div>
        </Col>

        {/* 정렬 기준 */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: 500, 
              color: '#262626', 
              marginBottom: '4px' 
            }}>
              정렬 기준
            </label>
            <Select
              value={filters.sortBy || 'createdAt'}
              onChange={handleSortChange}
              style={{ width: '100%' }}
            >
              <Option value="createdAt">가입일</Option>
              <Option value="updatedAt">수정일</Option>
              <Option value="lastLoginAt">마지막 로그인</Option>
              <Option value="email">이메일</Option>
              <Option value="firstName">이름</Option>
              <Option value="lastName">성</Option>
            </Select>
          </div>
        </Col>

        {/* 정렬 순서 */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: 500, 
              color: '#262626', 
              marginBottom: '4px' 
            }}>
              정렬 순서
            </label>
            <Select
              value={filters.sortOrder || 'desc'}
              onChange={handleSortOrderChange}
              style={{ width: '100%' }}
            >
              <Option value="desc">내림차순</Option>
              <Option value="asc">오름차순</Option>
            </Select>
          </div>
        </Col>
      </Row>

      {/* 페이지 크기 및 리셋 버튼 */}
      <Row justify="space-between" align="middle" style={{ marginTop: '16px' }}>
        <Col>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ 
              fontSize: '14px', 
              fontWeight: 500, 
              color: '#262626' 
            }}>
              페이지 크기:
            </label>
            <Select
              value={filters.limit || 10}
              onChange={handleLimitChange}
              style={{ width: 80 }}
            >
              <Option value={5}>5</Option>
              <Option value={10}>10</Option>
              <Option value={20}>20</Option>
              <Option value={50}>50</Option>
              <Option value={100}>100</Option>
            </Select>
          </div>
        </Col>

        <Col>
          <Button onClick={onReset}>
            필터 초기화
          </Button>
        </Col>
      </Row>
    </Card>
  );
};
