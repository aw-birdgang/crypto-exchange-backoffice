import React from 'react';
import { Resource, Permission } from '@crypto-exchange/shared';
import { usePermissions } from '../../../features/auth/application/hooks/usePermissions';

interface PermissionGateProps {
  resource: Resource;
  permission: Permission | Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean; // true면 모든 권한이 필요, false면 하나만 있으면 됨
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  resource,
  permission,
  children,
  fallback = null,
  requireAll = false,
}) => {
  const { hasPermission, hasAnyPermission } = usePermissions();

  const hasAccess = React.useMemo(() => {
    if (Array.isArray(permission)) {
      return requireAll
        ? permission.every(p => hasPermission(resource, p))
        : hasAnyPermission(resource, permission);
    }
    return hasPermission(resource, permission);
  }, [resource, permission, hasPermission, hasAnyPermission, requireAll]);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

interface MenuAccessGateProps {
  menuKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const MenuAccessGate: React.FC<MenuAccessGateProps> = ({
  menuKey,
  children,
  fallback = null,
}) => {
  const { hasMenuAccess } = usePermissions();
  const [hasAccess, setHasAccess] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    hasMenuAccess(menuKey).then(setHasAccess);
  }, [menuKey, hasMenuAccess]);

  if (hasAccess === null) {
    return null; // 로딩 중
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
