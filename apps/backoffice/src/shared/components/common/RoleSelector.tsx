import React from 'react';
import { Select, SelectProps, Tag, Tooltip } from 'antd';
import { UserRole } from '@crypto-exchange/shared';
import { usePermissionStore } from '../../../features/auth/application/stores/permission.store';

interface RoleSelectorProps extends Omit<SelectProps, 'options' | 'onChange'> {
  value?: string | string[];
  onChange?: (value: string | string[], option?: any) => void;
  multiple?: boolean;
  showSystemRoles?: boolean;
  showRoleDescription?: boolean;
}

const roleLabels: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: '최고 관리자',
  [UserRole.ADMIN]: '관리자',
  [UserRole.USER]: '사용자',
};

const roleDescriptions: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: '모든 권한을 가진 최고 관리자',
  [UserRole.ADMIN]: '대부분의 관리 기능에 접근 가능한 관리자',
  [UserRole.USER]: '일반 사용자',
};

const roleColors: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'red',
  [UserRole.ADMIN]: 'blue',
  [UserRole.USER]: 'default',
};

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  multiple = false,
  showSystemRoles = true,
  showRoleDescription = false,
  ...props
}) => {
  const { roles, rolesLoading } = usePermissionStore();

  const systemRoles = Object.values(UserRole);
  const availableRoles = showSystemRoles 
    ? [...systemRoles, ...roles.map(role => role.name as UserRole)]
    : roles.map(role => role.name as UserRole);

  const options = availableRoles.map(role => {
    const isSystemRole = systemRoles.includes(role as UserRole);
    const customRole = roles.find(r => r.name === role);
    
    return {
      value: role,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Tag color={roleColors[role as UserRole] || 'default'}>
              {roleLabels[role as UserRole] || role}
            </Tag>
            {isSystemRole && <Tag color="blue">시스템</Tag>}
          </div>
          {showRoleDescription && (
            <Tooltip title={roleDescriptions[role as UserRole] || customRole?.description}>
              <span style={{ fontSize: '12px', color: '#666' }}>
                {customRole?.description || roleDescriptions[role as UserRole]}
              </span>
            </Tooltip>
          )}
        </div>
      ),
    };
  });

  return (
    <Select
      {...props}
      value={value}
      onChange={onChange}
      mode={multiple ? 'multiple' : undefined}
      loading={rolesLoading}
      placeholder="역할을 선택하세요"
      optionFilterProp="children"
      filterOption={(input, option) => {
        const roleName = roleLabels[option?.value as UserRole] || option?.value;
        return roleName?.toLowerCase().includes(input.toLowerCase()) || false;
      }}
      options={options}
      style={{ width: '100%' }}
    />
  );
};

export default RoleSelector;
