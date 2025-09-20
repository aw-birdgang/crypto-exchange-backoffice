import React from 'react';
import { Select, SelectProps, Tag, Tooltip } from 'antd';
import { AdminUserRole } from '@crypto-exchange/shared';
import { usePermissionStore } from '../../../features/auth/application/stores/permission.store';

interface RoleSelectorProps extends Omit<SelectProps, 'options' | 'onChange'> {
  value?: string | string[];
  onChange?: (value: string | string[], option?: any) => void;
  multiple?: boolean;
  showSystemRoles?: boolean;
  showRoleDescription?: boolean;
}

const roleLabels: Record<AdminUserRole, string> = {
  [AdminUserRole.SUPER_ADMIN]: '최고 관리자',
  [AdminUserRole.ADMIN]: '관리자',
  [AdminUserRole.MODERATOR]: '모더레이터',
  [AdminUserRole.SUPPORT]: '고객 지원',
  [AdminUserRole.AUDITOR]: '감사자',
};

const roleDescriptions: Record<AdminUserRole, string> = {
  [AdminUserRole.SUPER_ADMIN]: '모든 권한을 가진 최고 관리자',
  [AdminUserRole.ADMIN]: '대부분의 관리 기능에 접근 가능한 관리자',
  [AdminUserRole.MODERATOR]: '콘텐츠 관리 권한을 가진 모더레이터',
  [AdminUserRole.SUPPORT]: '고객 지원 업무를 담당하는 지원팀',
  [AdminUserRole.AUDITOR]: '시스템 감사 및 보안 검토를 담당하는 감사자',
};

const roleColors: Record<AdminUserRole, string> = {
  [AdminUserRole.SUPER_ADMIN]: 'red',
  [AdminUserRole.ADMIN]: 'blue',
  [AdminUserRole.MODERATOR]: 'orange',
  [AdminUserRole.SUPPORT]: 'green',
  [AdminUserRole.AUDITOR]: 'purple',
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

  const systemRoles = Object.values(AdminUserRole);
  const availableRoles = showSystemRoles 
    ? [...systemRoles, ...roles.map(role => role.name as AdminUserRole)]
    : roles.map(role => role.name as AdminUserRole);

  const options = availableRoles.map(role => {
    const isSystemRole = systemRoles.includes(role as AdminUserRole);
    const customRole = roles.find(r => r.name === role);
    
    return {
      value: role,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Tag color={roleColors[role as AdminUserRole] || 'default'}>
              {roleLabels[role as AdminUserRole] || role}
            </Tag>
            {isSystemRole && <Tag color="blue">시스템</Tag>}
          </div>
          {showRoleDescription && (
            <Tooltip title={roleDescriptions[role as AdminUserRole] || customRole?.description}>
              <span style={{ fontSize: '12px', color: '#666' }}>
                {customRole?.description || roleDescriptions[role as AdminUserRole]}
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
        const roleName = roleLabels[option?.value as AdminUserRole] || option?.value;
        return roleName?.toLowerCase().includes(input.toLowerCase()) || false;
      }}
      options={options}
      style={{ width: '100%' }}
    />
  );
};

export default RoleSelector;
