import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  UserPermissions, 
  Role, 
  AdminUserRoleAssignment, 
  PermissionTemplate,
  Resource,
  Permission,
  AdminUserRole,
  STORAGE_KEYS
} from '@crypto-exchange/shared';
import { PermissionService } from '../services/permission.service';
import { useAuthStore } from './auth.store';

interface PermissionState {
  // 사용자 권한
  userPermissions: UserPermissions | null;
  permissionsLoading: boolean;
  
  // 역할 관리
  roles: Role[];
  rolesLoading: boolean;
  
  // 사용자 역할 할당
  userRoleAssignments: AdminUserRoleAssignment[];
  userRoleAssignmentsLoading: boolean;
  
  // 권한 템플릿
  permissionTemplates: PermissionTemplate[];
  templatesLoading: boolean;
  
  // 에러 상태
  error: string | null;
}

interface PermissionActions {
  // 사용자 권한 관련
  fetchUserPermissions: (userId: string) => Promise<void>;
  fetchMyPermissions: () => Promise<void>;
  setUserPermissions: (permissions: UserPermissions | null) => void;
  
  // 역할 관리 관련
  fetchRoles: () => Promise<void>;
  createRole: (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Role>;
  updateRole: (roleId: string, roleData: Partial<Role>) => Promise<Role>;
  deleteRole: (roleId: string) => Promise<void>;
  setRoles: (roles: Role[]) => void;
  
  // 사용자 역할 할당 관련
  fetchUserRoles: (userId: string) => Promise<void>;
  assignRoleToUser: (userId: string, roleId: string, expiresAt?: string) => Promise<void>;
  removeRoleFromUser: (userId: string, roleId: string) => Promise<void>;
  setUserRoleAssignments: (assignments: AdminUserRoleAssignment[]) => void;
  
  // 권한 템플릿 관련
  fetchPermissionTemplates: () => Promise<void>;
  createPermissionTemplate: (templateData: Omit<PermissionTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PermissionTemplate>;
  setPermissionTemplates: (templates: PermissionTemplate[]) => void;
  
  // 권한 확인 관련
  hasPermission: (resource: Resource, permission: Permission) => boolean;
  hasAnyPermission: (resource: Resource, permissions: Permission[]) => boolean;
  hasMenuAccess: (menuKey: string) => boolean;
  
  // 초기화
  initializePermissions: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

type PermissionStore = PermissionState & PermissionActions;

export const usePermissionStore = create<PermissionStore>()(
  persist(
    (set, get) => ({
      // State
      userPermissions: null,
      permissionsLoading: false,
      roles: [],
      rolesLoading: false,
      userRoleAssignments: [],
      userRoleAssignmentsLoading: false,
      permissionTemplates: [],
      templatesLoading: false,
      error: null,

      // Actions
      fetchUserPermissions: async (userId: string) => {
        set({ permissionsLoading: true, error: null });
        try {
          const permissions = await PermissionService.getUserPermissions(userId);
          set({ userPermissions: permissions, permissionsLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch user permissions',
            permissionsLoading: false 
          });
        }
      },

      fetchMyPermissions: async () => {
        set({ permissionsLoading: true, error: null });
        try {
          console.log('🔄 Fetching permissions from server...');
          const permissions = await PermissionService.getMyPermissions();
          console.log('✅ Permissions fetched successfully:', permissions);
          console.log('📊 Permission details:', {
            userId: permissions.userId,
            role: permissions.role,
            permissionCount: permissions.permissions?.length || 0,
            permissions: permissions.permissions?.map(p => ({
              resource: p.resource,
              permissionCount: p.permissions?.length || 0,
              permissions: p.permissions
            }))
          });
          set({ userPermissions: permissions, permissionsLoading: false });
        } catch (error) {
          console.warn('⚠️ Failed to fetch permissions, using default permissions:', error);
          // 권한을 가져올 수 없으면 기본 권한 설정
          const { user } = useAuthStore.getState();
          if (user) {
            console.log('🔧 Setting default permissions for role:', user.role);
            const defaultPermissions = PermissionService.getDefaultRolePermissions(user.role);
            console.log('🔧 Default permissions for role:', defaultPermissions);
            const permissions = {
              userId: user.id,
              role: user.role,
              permissions: Object.entries(defaultPermissions)
                .filter(([_, perms]) => perms && perms.length > 0)
                .map(([resource, perms]) => ({
                  resource: resource as any,
                  permissions: perms || [],
                })),
            };
            console.log('✅ Default permissions set:', permissions);
            set({ userPermissions: permissions, permissionsLoading: false, error: null });
          } else {
            console.error('❌ User not found when setting default permissions');
            set({ permissionsLoading: false, error: 'User not found' });
          }
        }
      },

      setUserPermissions: (permissions: UserPermissions | null) => {
        set({ userPermissions: permissions });
      },

      fetchRoles: async () => {
        set({ rolesLoading: true, error: null });
        try {
          const roles = await PermissionService.getRoles();
          set({ roles: Array.isArray(roles) ? roles : [], rolesLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch roles',
            rolesLoading: false,
            roles: [] // 에러 발생 시 빈 배열로 초기화
          });
        }
      },

      createRole: async (roleData) => {
        set({ error: null });
        try {
          const newRole = await PermissionService.createRole(roleData);
          
          // 서버에서 최신 역할 목록을 다시 가져옴
          await get().fetchRoles();
          
          return newRole;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create role' });
          throw error;
        }
      },

      updateRole: async (roleId, roleData) => {
        set({ error: null });
        try {
          const updatedRole = await PermissionService.updateRole(roleId, roleData);
          
          // 서버에서 최신 역할 목록을 다시 가져옴
          await get().fetchRoles();
          
          return updatedRole;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update role' });
          throw error;
        }
      },

      deleteRole: async (roleId) => {
        set({ error: null });
        try {
          await PermissionService.deleteRole(roleId);
          
          // 서버에서 최신 역할 목록을 다시 가져옴
          await get().fetchRoles();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete role' });
          throw error;
        }
      },

      setRoles: (roles: Role[]) => {
        set({ roles });
      },

      fetchUserRoles: async (userId: string) => {
        set({ userRoleAssignmentsLoading: true, error: null });
        try {
          const assignments = await PermissionService.getUserRoles(userId);
          set({ userRoleAssignments: assignments, userRoleAssignmentsLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch user roles',
            userRoleAssignmentsLoading: false 
          });
        }
      },

      assignRoleToUser: async (userId, roleId, expiresAt) => {
        set({ error: null });
        try {
          await PermissionService.assignRoleToUser(userId, roleId, expiresAt);
          // 사용자 역할 목록을 다시 가져옴
          await get().fetchUserRoles(userId);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to assign role to user' });
          throw error;
        }
      },

      removeRoleFromUser: async (userId, roleId) => {
        set({ error: null });
        try {
          await PermissionService.removeRoleFromUser(userId, roleId);
          // 사용자 역할 목록을 다시 가져옴
          await get().fetchUserRoles(userId);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to remove role from user' });
          throw error;
        }
      },

      setUserRoleAssignments: (assignments: AdminUserRoleAssignment[]) => {
        set({ userRoleAssignments: assignments });
      },

      fetchPermissionTemplates: async () => {
        set({ templatesLoading: true, error: null });
        try {
          const templates = await PermissionService.getPermissionTemplates();
          set({ permissionTemplates: templates, templatesLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch permission templates',
            templatesLoading: false 
          });
        }
      },

      createPermissionTemplate: async (templateData) => {
        set({ error: null });
        try {
          const newTemplate = await PermissionService.createPermissionTemplate(templateData);
          const currentTemplates = get().permissionTemplates;
          set({ permissionTemplates: [...currentTemplates, newTemplate] });
          return newTemplate;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create permission template' });
          throw error;
        }
      },

      setPermissionTemplates: (templates: PermissionTemplate[]) => {
        set({ permissionTemplates: templates });
      },

      hasPermission: (resource: Resource, permission: Permission): boolean => {
        const { userPermissions } = get();
        if (!userPermissions) {
          console.log('❌ No user permissions found');
          return false;
        }
        
        // SUPER_ADMIN은 모든 권한을 가짐
        if (userPermissions.role === AdminUserRole.SUPER_ADMIN) {
          console.log('✅ SUPER_ADMIN has all permissions');
          return true;
        }
        
        const resourcePermission = userPermissions.permissions.find(p => p.resource === resource);
        if (!resourcePermission) {
          console.log(`❌ No permissions found for resource: ${resource}`);
          return false;
        }
        
        const hasPermission = resourcePermission.permissions.includes(permission) || 
               resourcePermission.permissions.includes(Permission.MANAGE);
        
        console.log(`🔍 Permission check: ${resource}.${permission} = ${hasPermission}`);
        return hasPermission;
      },

      hasAnyPermission: (resource: Resource, permissions: Permission[]): boolean => {
        const { hasPermission } = get();
        return permissions.some(permission => hasPermission(resource, permission));
      },

      hasMenuAccess: (menuKey: string): boolean => {
        const { userPermissions } = get();
        if (!userPermissions) return false;
        
        // SUPER_ADMIN은 모든 메뉴에 접근 가능
        if (userPermissions.role === AdminUserRole.SUPER_ADMIN) return true;
        
        // 메뉴별 기본 접근 권한 (실제로는 서버에서 확인해야 함)
        const menuPermissions: Record<string, AdminUserRole[]> = {
          dashboard: [AdminUserRole.SUPER_ADMIN, AdminUserRole.ADMIN],
          permissions: [AdminUserRole.SUPER_ADMIN, AdminUserRole.ADMIN],
          users: [AdminUserRole.SUPER_ADMIN, AdminUserRole.ADMIN],
          roles: [AdminUserRole.SUPER_ADMIN, AdminUserRole.ADMIN],
        };
        
        const allowedRoles = menuPermissions[menuKey];
        return allowedRoles ? allowedRoles.includes(userPermissions.role) : false;
      },

      initializePermissions: async () => {
        set({ error: null });
        try {
          await PermissionService.initializePermissions();
          // 초기화 후 필요한 데이터들을 다시 가져옴
          await Promise.all([
            get().fetchMyPermissions(),
            get().fetchRoles(),
            get().fetchPermissionTemplates(),
          ]);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to initialize permissions' });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        console.log('🔄 Resetting permission store...');
        
        // localStorage에서 권한 관련 데이터 정리
        localStorage.removeItem(STORAGE_KEYS.PERMISSION_STORAGE);
        
        set({
          userPermissions: null,
          permissionsLoading: false,
          roles: [],
          rolesLoading: false,
          userRoleAssignments: [],
          userRoleAssignmentsLoading: false,
          permissionTemplates: [],
          templatesLoading: false,
          error: null,
        });
        
        console.log('✅ Permission store reset completed');
      },
    }),
    {
      name: 'permission-storage',
      partialize: (state) => ({
        userPermissions: state.userPermissions,
        roles: state.roles,
        permissionTemplates: state.permissionTemplates,
      }),
      onRehydrateStorage: () => (state) => {
        // 저장된 데이터가 복원된 후 로딩 상태를 false로 설정
        if (state) {
          state.permissionsLoading = false;
          state.rolesLoading = false;
          state.userRoleAssignmentsLoading = false;
          state.templatesLoading = false;
        }
      },
    },
  ),
);
