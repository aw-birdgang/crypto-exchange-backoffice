import React, { useMemo } from 'react';
import { Table, TableProps, Button, Space, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

interface ActionButton {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (record: any) => void;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  danger?: boolean;
  disabled?: (record: any) => boolean;
}

interface DataTableProps<T = any> extends Omit<TableProps<T>, 'columns'> {
  columns: ColumnsType<T>;
  actions?: ActionButton[];
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onView?: (record: T) => void;
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export function DataTable<T = any>({
  columns,
  actions = [],
  onEdit,
  onDelete,
  onView,
  loading = false,
  pagination,
  ...props
}: DataTableProps<T>) {
  const actionColumn = useMemo(() => {
    if (actions.length === 0 && !onEdit && !onDelete && !onView) {
      return null;
    }

    const defaultActions: ActionButton[] = [];
    
    if (onView) {
      defaultActions.push({
        key: 'view',
        label: 'View',
        icon: <EyeOutlined />,
        onClick: onView,
        type: 'text',
      });
    }
    
    if (onEdit) {
      defaultActions.push({
        key: 'edit',
        label: 'Edit',
        icon: <EditOutlined />,
        onClick: onEdit,
        type: 'text',
      });
    }
    
    if (onDelete) {
      defaultActions.push({
        key: 'delete',
        label: 'Delete',
        icon: <DeleteOutlined />,
        onClick: onDelete,
        type: 'text',
        danger: true,
      });
    }

    const allActions = [...defaultActions, ...actions];

    return {
      title: 'Actions',
      key: 'actions',
      width: allActions.length * 80,
      render: (_: any, record: T) => (
        <Space size="small">
          {allActions.map((action) => (
            <Button
              key={action.key}
              type={action.type}
              size="small"
              icon={action.icon}
              danger={action.danger}
              disabled={action.disabled?.(record)}
              onClick={() => action.onClick(record)}
            >
              {action.label}
            </Button>
          ))}
        </Space>
      ),
    };
  }, [actions, onEdit, onDelete, onView]);

  const finalColumns = useMemo(() => {
    const cols = [...columns];
    if (actionColumn) {
      cols.push(actionColumn);
    }
    return cols;
  }, [columns, actionColumn]);

  return (
    <Table
      {...props}
      columns={finalColumns}
      loading={loading}
      pagination={pagination ? {
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} of ${total} items`,
        onChange: pagination.onChange,
      } : false}
      rowKey="id"
      scroll={{ x: 800 }}
    />
  );
}
