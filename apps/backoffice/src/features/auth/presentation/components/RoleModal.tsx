import React from 'react';
import { Modal, Form } from 'antd';
import { Role } from '@crypto-exchange/shared';
import { RoleForm } from './RoleForm';

interface RoleModalProps {
  isVisible: boolean;
  editingRole: Role | null;
  onOk: () => void;
  onCancel: () => void;
  form: any;
  onPermissionsChange: (permissions: any[]) => void;
}

export const RoleModal: React.FC<RoleModalProps> = ({
  isVisible,
  editingRole,
  onOk,
  onCancel,
  form,
  onPermissionsChange,
}) => {
  return (
    <Modal
      title={editingRole ? '역할 수정' : '역할 생성'}
      open={isVisible}
      onOk={onOk}
      onCancel={onCancel}
      width={800}
      okText={editingRole ? '수정' : '생성'}
      cancelText="취소"
    >
      <RoleForm
        form={form}
        editingRole={editingRole}
        onPermissionsChange={onPermissionsChange}
      />
    </Modal>
  );
};
