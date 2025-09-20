import React from 'react';
import { Form, Input, Typography } from 'antd';
import { Role } from '@crypto-exchange/shared';
import { PermissionMatrix } from '../../../../shared/components/common/PermissionMatrix';

const { TextArea } = Input;

interface RoleFormProps {
  form: any;
  editingRole?: Role | null;
  onPermissionsChange: (permissions: any[]) => void;
}

export const RoleForm: React.FC<RoleFormProps> = ({
  form,
  editingRole,
  onPermissionsChange,
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        name: editingRole?.name,
        description: editingRole?.description,
        permissions: Array.isArray(editingRole?.permissions) ? editingRole.permissions : [],
      }}
    >
      <Form.Item
        name="name"
        label="역할명"
        rules={[
          { required: true, message: '역할명을 입력해주세요' },
          { min: 2, max: 50, message: '역할명은 2-50자 사이여야 합니다' },
        ]}
      >
        <Input placeholder="역할명을 입력하세요" />
      </Form.Item>

      <Form.Item
        name="description"
        label="설명"
        rules={[
          { required: true, message: '설명을 입력해주세요' },
          { max: 200, message: '설명은 200자 이하여야 합니다' },
        ]}
      >
        <TextArea
          placeholder="역할에 대한 설명을 입력하세요"
          rows={3}
        />
      </Form.Item>

      <Form.Item
        name="permissions"
        label="권한 설정"
      >
        <PermissionMatrix
          permissions={Array.isArray(editingRole?.permissions) 
            ? editingRole.permissions.map(rp => ({
                resource: rp.resource,
                permissions: rp.permissions
              }))
            : []}
          onChange={onPermissionsChange}
        />
      </Form.Item>
    </Form>
  );
};
