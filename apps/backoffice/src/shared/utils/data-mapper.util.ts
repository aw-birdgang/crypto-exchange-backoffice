import { AdminUser, UserStatus } from '@crypto-exchange/shared';

/**
 * Frontend 데이터 변환 유틸리티
 */
export class DataMapper {
  /**
   * 사용자 통계 계산
   */
  static calculateUserStats(users: AdminUser[]) {
    return {
      pending: users.filter(user => user.status === UserStatus.PENDING).length,
      approved: users.filter(user => user.status === UserStatus.APPROVED).length,
      rejected: users.filter(user => user.status === UserStatus.REJECTED).length,
      suspended: users.filter(user => user.status === UserStatus.SUSPENDED).length,
      active: users.filter(user => user.isActive).length,
      inactive: users.filter(user => !user.isActive).length,
    };
  }

  /**
   * 사용자 필터링
   */
  static filterUsers(users: AdminUser[], filters: {
    status?: UserStatus;
    role?: string;
    searchQuery?: string;
  }) {
    return users.filter(user => {
      // 상태 필터
      if (filters.status && user.status !== filters.status) {
        return false;
      }

      // 역할 필터
      if (filters.role && user.adminRole !== filters.role) {
        return false;
      }

      // 검색 쿼리 필터
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText = [
          user.email,
          user.firstName,
          user.lastName,
          user.adminRole
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * 사용자 정렬
   */
  static sortUsers(users: AdminUser[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') {
    return [...users].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'firstName':
          aValue = a.firstName;
          bValue = b.firstName;
          break;
        case 'lastName':
          aValue = a.lastName;
          bValue = b.lastName;
          break;
        case 'role':
          aValue = a.adminRole;
          bValue = b.adminRole;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * 선택된 사용자 객체 추출
   */
  static getSelectedUserObjects(users: AdminUser[], selectedUserIds: string[]) {
    return users.filter(user => selectedUserIds.includes(user.id));
  }

  /**
   * 사용자 상태별 그룹화
   */
  static groupUsersByStatus(users: AdminUser[]) {
    return users.reduce((groups, user) => {
      const status = user.status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(user);
      return groups;
    }, {} as Record<UserStatus, AdminUser[]>);
  }
}
