import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { Resource, Permission, UserPermissions } from '@crypto-exchange/shared';
import { apiService } from '../../../../shared/services/api.service';

export const usePermissions = () => {
  const { user, accessToken } = useAuthStore();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPermissions = useCallback(async () => {
    if (!user || !accessToken) {
      setPermissions(null);
      setLoading(false);
      return;
    }

    // 임시로 API 호출 없이 기본 권한 설정
    if (user.role === 'super_admin') {
      setPermissions({
        userId: user.id,
        role: user.role,
        permissions: [
          { resource: 'dashboard', permissions: ['manage'] },
          { resource: 'users', permissions: ['manage'] },
          { resource: 'orders', permissions: ['manage'] },
          { resource: 'markets', permissions: ['manage'] },
          { resource: 'wallets', permissions: ['manage'] },
          { resource: 'settings', permissions: ['manage'] },
          { resource: 'reports', permissions: ['manage'] },
          { resource: 'audit_logs', permissions: ['manage'] },
        ]
      });
    }
    setLoading(false);
  }, [user, accessToken]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback((resource: Resource, permission: Permission): boolean => {
    if (!permissions) return false;
    
    // SUPER_ADMIN은 모든 권한을 가짐
    if (permissions.role === 'super_admin') return true;
    
    const resourcePermission = permissions.permissions.find(p => p.resource === resource);
    if (!resourcePermission) return false;
    
    return resourcePermission.permissions.includes(permission) || 
           resourcePermission.permissions.includes(Permission.MANAGE);
  }, [permissions]);

  const hasAnyPermission = useCallback((resource: Resource, permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(resource, permission));
  }, [hasPermission]);

  const hasMenuAccess = useCallback(async (menuKey: string): Promise<boolean> => {
    if (!user || !accessToken) return false;
    
    // 임시로 super_admin은 모든 메뉴에 접근 가능
    if (user.role === 'super_admin') return true;
    
    // 다른 역할에 대한 기본 메뉴 접근 권한
    const menuPermissions: Record<string, string[]> = {
      dashboard: ['super_admin', 'admin', 'user_manager', 'order_manager', 'market_manager', 'wallet_manager'],
      users: ['super_admin', 'admin', 'user_manager'],
      orders: ['super_admin', 'admin', 'order_manager'],
      markets: ['super_admin', 'admin', 'market_manager'],
      wallets: ['super_admin', 'admin', 'wallet_manager'],
      settings: ['super_admin'],
      reports: ['super_admin', 'admin', 'user_manager', 'order_manager', 'market_manager', 'wallet_manager'],
      audit_logs: ['super_admin'],
    };
    
    const allowedRoles = menuPermissions[menuKey];
    return allowedRoles ? allowedRoles.includes(user.role) : false;
  }, [user, accessToken]);

  const checkPermission = useCallback(async (resource: Resource, permission: Permission): Promise<boolean> => {
    if (!user || !accessToken) return false;
    
    try {
      const response = await apiService.post<{ hasPermission: boolean }>('/permissions/check', {
        resource,
        permission,
      });
      return response.hasPermission;
    } catch (error) {
      console.error('Failed to check permission:', error);
      return false;
    }
  }, [user, accessToken]);

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasMenuAccess,
    checkPermission,
    refetchPermissions: fetchPermissions,
  };
};
