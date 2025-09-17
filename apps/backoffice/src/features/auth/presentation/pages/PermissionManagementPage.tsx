import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  UserOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { UserRole, Resource, Permission, RolePermission } from '@crypto-exchange/shared';
import { PermissionGate } from '../../../../shared/components/common/PermissionGate';
import { apiService } from '../../../../shared/services/api.service';

const { Title, Text } = Typography;
const { Option } = Select;

interface PermissionManagementPageProps {}

export const PermissionManagementPage: React.FC<PermissionManagementPageProps> = () => {
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<RolePermission | null>(null);
  const [form] = Form.useForm();

  const fetchRolePermissions = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<RolePermission[]>('/permissions/role-permissions');
      setRolePermissions(response);
    } catch (error) {
      message.error('권한 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolePermissions();
  }, []);

  const handleCreate = () => {
    setEditingPermission(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: RolePermission) => {
    setEditingPermission(record);
    form.setFieldsValue({
      role: record.role,
      resource: record.resource,
      permissions: record.permissions,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.delete(`/permissions/role-permissions/${id}`);
      message.success('권한이 삭제되었습니다.');
      fetchRolePermissions();
    } catch (error) {
      message.error('권한 삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingPermission) {
        await apiService.put(`/permissions/role-permissions/${editingPermission.id}`, values);
        message.success('권한이 수정되었습니다.');
      } else {
        await apiService.post('/permissions/role-permissions', values);
        message.success('권한이 생성되었습니다.');
      }
      setModalVisible(false);
      fetchRolePermissions();
    } catch (error) {
      message.error('권한 저장에 실패했습니다.');
    }
  };

  const columns = [
    {
      title: '역할',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color="blue" icon={<UserOutlined />}>
          {role}
        </Tag>
      ),
    },
    {
      title: '리소스',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource: Resource) => (
        <Tag color="green" icon={<LockOutlined />}>
          {resource}
        </Tag>
      ),
    },
    {
      title: '권한',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: Permission[]) => (
        <Space wrap>
          {permissions.map(permission => (
            <Tag key={permission} color="orange">
              {permission}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '작업',
      key: 'actions',
      render: (_: any, record: RolePermission) => (
        <Space>
          <PermissionGate resource={Resource.SETTINGS} permission={Permission.UPDATE}>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              수정
            </Button>
          </PermissionGate>
          <PermissionGate resource={Resource.SETTINGS} permission={Permission.DELETE}>
            <Popconfirm
              title="이 권한을 삭제하시겠습니까?"
              onConfirm={() => handleDelete(record.id)}
              okText="삭제"
              cancelText="취소"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                삭제
              </Button>
            </Popconfirm>
          </PermissionGate>
        </Space>
      ),
    },
  ];

  const roleStats = rolePermissions.reduce((acc, permission) => {
    if (!acc[permission.role]) {
      acc[permission.role] = 0;
    }
    acc[permission.role]++;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <SettingOutlined /> 권한 관리
        </Title>
        <Text type="secondary">
          사용자 역할별 리소스 접근 권한을 관리합니다.
        </Text>
      </div>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="총 권한 수"
              value={rolePermissions.length}
              prefix={<LockOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="역할 수"
              value={Object.keys(roleStats).length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <div>
              <Text strong>역할별 권한 분포</Text>
              <div style={{ marginTop: '8px' }}>
                {Object.entries(roleStats).map(([role, count]) => (
                  <Tag key={role} style={{ marginBottom: '4px' }}>
                    {role}: {count}개
                  </Tag>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="권한 목록"
        extra={
          <PermissionGate resource={Resource.SETTINGS} permission={Permission.CREATE}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              권한 추가
            </Button>
          </PermissionGate>
        }
      >
        <Table
          columns={columns}
          dataSource={rolePermissions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / 총 ${total}개`,
          }}
        />
      </Card>

      <Modal
        title={editingPermission ? '권한 수정' : '권한 추가'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="role"
            label="역할"
            rules={[{ required: true, message: '역할을 선택해주세요.' }]}
          >
            <Select placeholder="역할을 선택하세요">
              {Object.values(UserRole).map(role => (
                <Option key={role} value={role}>
                  {role}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="resource"
            label="리소스"
            rules={[{ required: true, message: '리소스를 선택해주세요.' }]}
          >
            <Select placeholder="리소스를 선택하세요">
              {Object.values(Resource).map(resource => (
                <Option key={resource} value={resource}>
                  {resource}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="permissions"
            label="권한"
            rules={[{ required: true, message: '권한을 선택해주세요.' }]}
          >
            <Select
              mode="multiple"
              placeholder="권한을 선택하세요"
              style={{ width: '100%' }}
            >
              {Object.values(Permission).map(permission => (
                <Option key={permission} value={permission}>
                  {permission}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                취소
              </Button>
              <Button type="primary" htmlType="submit">
                {editingPermission ? '수정' : '생성'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
