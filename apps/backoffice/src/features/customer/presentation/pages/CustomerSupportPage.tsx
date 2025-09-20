import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Input, Select, Row, Col, Badge, Avatar } from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  MessageOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;

export const CustomerSupportPage: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
  });

  // 임시 데이터
  const supportTickets = [
    {
      id: '1',
      ticketId: 'TKT001',
      customerName: '김철수',
      customerEmail: 'kim@example.com',
      subject: '로그인 문제',
      status: 'open',
      priority: 'high',
      category: '기술 지원',
      assignedTo: '지원팀 A',
      createdAt: '2024-01-15 10:30:00',
      lastUpdated: '2024-01-15 14:20:00',
    },
    {
      id: '2',
      ticketId: 'TKT002',
      customerName: '이영희',
      customerEmail: 'lee@example.com',
      subject: '결제 오류',
      status: 'in_progress',
      priority: 'medium',
      category: '결제',
      assignedTo: '지원팀 B',
      createdAt: '2024-01-15 09:15:00',
      lastUpdated: '2024-01-15 11:45:00',
    },
    {
      id: '3',
      ticketId: 'TKT003',
      customerName: '박민수',
      customerEmail: 'park@example.com',
      subject: '계정 복구',
      status: 'resolved',
      priority: 'low',
      category: '계정',
      assignedTo: '지원팀 A',
      createdAt: '2024-01-14 16:20:00',
      lastUpdated: '2024-01-15 08:30:00',
    },
  ];

  const columns = [
    {
      title: '티켓 ID',
      dataIndex: 'ticketId',
      key: 'ticketId',
      width: 100,
    },
    {
      title: '고객',
      key: 'customer',
      width: 200,
      render: (record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
            {record.customerName[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.customerName}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.customerEmail}</div>
          </div>
        </div>
      ),
    },
    {
      title: '제목',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          open: { color: 'red', text: '열림', icon: <ClockCircleOutlined /> },
          in_progress: { color: 'orange', text: '진행중', icon: <ClockCircleOutlined /> },
          resolved: { color: 'green', text: '해결됨', icon: <CheckCircleOutlined /> },
          closed: { color: 'default', text: '닫힘', icon: <CloseCircleOutlined /> },
        };
        const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status, icon: null };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '우선순위',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        const priorityMap = {
          high: { color: 'red', text: '높음' },
          medium: { color: 'orange', text: '보통' },
          low: { color: 'green', text: '낮음' },
        };
        const config = priorityMap[priority as keyof typeof priorityMap] || { color: 'default', text: priority };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '담당자',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 120,
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
    },
  ];

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
    });
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: '#262626', 
              margin: 0,
              lineHeight: 1.2
            }}>
              고객 지원
            </h2>
            <p style={{ 
              marginTop: '8px', 
              fontSize: '14px', 
              color: '#8c8c8c',
              margin: 0
            }}>
              고객 문의사항과 지원 티켓을 관리할 수 있습니다.
            </p>
          </div>
          <Space>
            <Button icon={<MessageOutlined />} type="primary">
              새 티켓
            </Button>
            <Button icon={<ReloadOutlined />}>
              새로고침
            </Button>
          </Space>
        </div>

        {/* 요약 카드 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Badge count={5} size="small">
                  <ClockCircleOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />
                </Badge>
                <div style={{ marginTop: '8px', fontWeight: 500 }}>대기 중</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Badge count={12} size="small">
                  <MessageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                </Badge>
                <div style={{ marginTop: '8px', fontWeight: 500 }}>진행 중</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Badge count={8} size="small">
                  <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                </Badge>
                <div style={{ marginTop: '8px', fontWeight: 500 }}>해결됨</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Badge count={3} size="small">
                  <CloseCircleOutlined style={{ fontSize: '24px', color: '#8c8c8c' }} />
                </Badge>
                <div style={{ marginTop: '8px', fontWeight: 500 }}>닫힘</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 필터 */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Input
                placeholder="티켓 ID 또는 고객명 검색"
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder="상태"
                style={{ width: '100%' }}
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                allowClear
              >
                <Option value="open">열림</Option>
                <Option value="in_progress">진행중</Option>
                <Option value="resolved">해결됨</Option>
                <Option value="closed">닫힘</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <Space>
                <Button onClick={handleResetFilters}>
                  초기화
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 지원 티켓 테이블 */}
        <Card>
          <Table
            columns={columns}
            dataSource={supportTickets}
            rowKey="id"
            pagination={{
              total: supportTickets.length,
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} / ${total}건`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>
    </div>
  );
};
