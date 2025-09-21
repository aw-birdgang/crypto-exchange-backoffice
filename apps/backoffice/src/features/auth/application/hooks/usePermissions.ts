import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { usePermissionStore } from '../stores/permission.store';
import { Resource, Permission } from '@crypto-exchange/shared';
import { PermissionService } from '../services/permission.service';

// PermissionService 인스턴스 생성
const permissionService = new PermissionService();

export const usePermissions = () => {
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const {
    userPermissions,
    permissionsLoading,
    hasPermission: storeHasPermission,
    hasAnyPermission: storeHasAnyPermission,
    hasMenuAccess: storeHasMenuAccess,
    fetchMyPermissions,
    error,
  } = usePermissionStore();

  // 인증 상태가 변경될 때 권한을 가져옴 (토큰이 있을 때만)
  useEffect(() => {
    if (isAuthenticated && user && accessToken && !userPermissions && !permissionsLoading) {
      console.log('🔄 Fetching permissions for user:', user.id);
      fetchMyPermissions();
    }
  }, [isAuthenticated, user?.id, accessToken, userPermissions, permissionsLoading, fetchMyPermissions]);

  // 권한 확인 함수들
  const hasPermission = useCallback((resource: Resource, permission: Permission): boolean => {
    return storeHasPermission(resource, permission);
  }, [storeHasPermission]);

  const hasAnyPermission = useCallback((resource: Resource, permissions: Permission[]): boolean => {
    return storeHasAnyPermission(resource, permissions);
  }, [storeHasAnyPermission]);

  const hasMenuAccess = useCallback(async (menuKey: string): Promise<boolean> => {
    // 먼저 로컬 권한 확인
    const localAccess = storeHasMenuAccess(menuKey);
    if (localAccess) return true;

    // 서버에서 권한 확인
    try {
      return await permissionService.checkMenuAccess(menuKey);
    } catch (error) {
      console.error('Failed to check menu access:', error);
      return false;
    }
  }, [storeHasMenuAccess]);

  const checkPermission = useCallback(async (resource: Resource, permission: Permission): Promise<boolean> => {
    if (!user || !accessToken) return false;
    
    try {
      const response = await permissionService.checkPermission({
        resource,
        permission,
        userId: user.id,
      });
      return response.hasPermission;
    } catch (error) {
      console.error('Failed to check permission:', error);
      return false;
    }
  }, [user, accessToken]);

  return {
    permissions: userPermissions,
    loading: permissionsLoading,
    hasPermission,
    hasAnyPermission,
    hasMenuAccess,
    checkPermission,
    refetchPermissions: fetchMyPermissions,
    error,
  };
};
