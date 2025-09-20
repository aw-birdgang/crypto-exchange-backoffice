import {
  UserPermissions,
  Role,
  AdminUserRoleAssignment,
  PermissionTemplate,
  PermissionCheckRequest,
  PermissionCheckResponse,
  Resource,
  Permission,
  AdminUserRole
} from '@crypto-exchange/shared';
import { apiService } from '../../../../shared/services/api.service';

export class PermissionService {
  /**
   * 사용자의 권한 정보를 가져옵니다
   */
  static async getUserPermissions(userId: string): Promise<UserPermissions> {
    try {
      const response = await apiService.get<UserPermissions>(`/permissions/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch user permissions:', error);
      throw error;
    }
  }

  /**
   * 현재 사용자의 권한 정보를 가져옵니다
   */
  static async getMyPermissions(): Promise<UserPermissions> {
    try {
      const response = await apiService.get<UserPermissions>('/permissions/my-permissions');
      return response;
    } catch (error) {
      console.error('Failed to fetch my permissions:', error);
      throw error;
    }
  }

  /**
   * 모든 역할 목록을 가져옵니다
   */
  static async getRoles(): Promise<Role[]> {
    try {
      console.log('🔄 Fetching roles from API...');
      const response = await apiService.get<{ roles: Role[]; total: number }>('/permissions/roles');
      console.log('✅ Roles response received:', response);
      return Array.isArray(response.roles) ? response.roles : [];
    } catch (error) {
      console.error('❌ Failed to fetch roles:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        statusText: (error as any)?.response?.statusText,
        data: (error as any)?.response?.data,
      });
      // 에러 발생 시 빈 배열 반환하여 앱이 크래시되지 않도록 함
      return [];
    }
  }

  /**
   * 역할을 생성합니다
   */
  static async createRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    try {
      const response = await apiService.post<Role>('/permissions/roles', roleData);
      return response;
    } catch (error) {
      console.error('Failed to create role:', error);
      throw error;
    }
  }

  /**
   * 역할을 업데이트합니다
   */
  static async updateRole(roleId: string, roleData: Partial<Role>): Promise<Role> {
    try {
      const response = await apiService.put<Role>(`/permissions/roles/${roleId}`, roleData);
      return response;
    } catch (error) {
      console.error('Failed to update role:', error);
      throw error;
    }
  }

  /**
   * 역할을 삭제합니다
   */
  static async deleteRole(roleId: string): Promise<void> {
    try {
      await apiService.delete(`/permissions/roles/${roleId}`);
    } catch (error) {
      console.error('Failed to delete role:', error);
      throw error;
    }
  }

  /**
   * 사용자에게 역할을 할당합니다
   */
  static async assignRoleToUser(
    userId: string,
    roleId: string,
    expiresAt?: string
  ): Promise<AdminUserRoleAssignment> {
    try {
      const response = await apiService.post<AdminUserRoleAssignment>('/permissions/user-roles', {
        userId,
        roleId,
        expiresAt,
      });
      return response;
    } catch (error) {
      console.error('Failed to assign role to user:', error);
      throw error;
    }
  }

  /**
   * 사용자의 역할 할당을 해제합니다
   */
  static async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    try {
      await apiService.delete(`/permissions/user-roles/${userId}/${roleId}`);
    } catch (error) {
      console.error('Failed to remove role from user:', error);
      throw error;
    }
  }

  /**
   * 사용자의 모든 역할을 가져옵니다
   */
  static async getUserRoles(userId: string): Promise<AdminUserRoleAssignment[]> {
    try {
      const response = await apiService.get<AdminUserRoleAssignment[]>(`/permissions/user-roles/${userId}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch user roles:', error);
      throw error;
    }
  }

  /**
   * 권한 템플릿 목록을 가져옵니다
   */
  static async getPermissionTemplates(): Promise<PermissionTemplate[]> {
    try {
      const response = await apiService.get<PermissionTemplate[]>('/permissions/templates');
      return response;
    } catch (error) {
      console.error('Failed to fetch permission templates:', error);
      throw error;
    }
  }

  /**
   * 권한 템플릿을 생성합니다
   */
  static async createPermissionTemplate(
    templateData: Omit<PermissionTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PermissionTemplate> {
    try {
      const response = await apiService.post<PermissionTemplate>('/permissions/templates', templateData);
      return response;
    } catch (error) {
      console.error('Failed to create permission template:', error);
      throw error;
    }
  }

  /**
   * 권한을 확인합니다
   */
  static async checkPermission(request: PermissionCheckRequest): Promise<PermissionCheckResponse> {
    try {
      const response = await apiService.post<PermissionCheckResponse>('/permissions/check', request);
      return response;
    } catch (error) {
      console.error('Failed to check permission:', error);
      throw error;
    }
  }

  /**
   * 메뉴 접근 권한을 확인합니다
   */
  static async checkMenuAccess(menuKey: string): Promise<boolean> {
    try {
      const response = await apiService.post<{ hasAccess: boolean }>('/permissions/menu-access', {
        menuKey,
      });
      return response.hasAccess;
    } catch (error) {
      console.error('Failed to check menu access:', error);
      return false;
    }
  }

  /**
   * 권한 시스템을 초기화합니다 (개발/테스트용)
   */
  static async initializePermissions(): Promise<void> {
    try {
      await apiService.post('/permissions/initialize');
    } catch (error) {
      console.error('Failed to initialize permissions:', error);
      throw error;
    }
  }

  /**
   * 역할별 기본 권한을 가져옵니다
   */
  static getDefaultRolePermissions(role: AdminUserRole): Partial<Record<Resource, Permission[]>> {
    const defaultPermissions: Record<string, Partial<Record<Resource, Permission[]>>> = {
      super_admin: {
        [Resource.DASHBOARD]: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE, Permission.MANAGE],
        [Resource.SETTINGS]: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE, Permission.MANAGE],
        [Resource.PERMISSIONS]: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE, Permission.MANAGE],
        [Resource.ROLES]: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE, Permission.MANAGE],
      },
      admin: {
        [Resource.DASHBOARD]: [Permission.READ],
        [Resource.SETTINGS]: [Permission.READ],
        [Resource.PERMISSIONS]: [Permission.READ],
        [Resource.ROLES]: [Permission.READ],
      },
    };

    return defaultPermissions[role] || {};
  }
}
