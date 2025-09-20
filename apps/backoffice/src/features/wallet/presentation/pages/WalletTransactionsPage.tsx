import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Input, Select, DatePicker, Row, Col } from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  DownloadOutlined,
  FilterOutlined 
} from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

export const WalletTransactionsPage: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    dateRange: null,
  });

  // 임시 데이터
  const transactions = [
    {
      id: '1',
      transactionId: 'TXN001',
      walletId: 'W001',
      type: 'deposit',
      amount: 1000,
      currency: 'USDT',
      status: 'completed',
      fee: 5,
      timestamp: '2024-01-15 10:30:00',
      from: '0x1234...5678',
      to: '0xabcd...efgh',
    },
    {
      id: '2',
      transactionId: 'TXN002',
      walletId: 'W002',
      type: 'withdrawal',
      amount: 0.5,
      currency: 'BTC',
      status: 'pending',
      fee: 0.001,
      timestamp: '2024-01-15 09:15:00',
      from: '0xabcd...efgh',
      to: '0x5678...1234',
    },
    {
      id: '3',
      transactionId: 'TXN003',
      walletId: 'W003',
      type: 'transfer',
      amount: 250,
      currency: 'ETH',
      status: 'completed',
      fee: 0.01,
      timestamp: '2024-01-15 08:45:00',
      from: '0x5678...1234',
      to: '0xefgh...abcd',
    },
  ];

  const columns = [
    {
      title: '거래 ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 120,
    },
    {
      title: '지갑 ID',
      dataIndex: 'walletId',
      key: 'walletId',
      width: 100,
    },
    {
      title: '유형',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap = {
          deposit: { color: 'green', text: '입금' },
          withdrawal: { color: 'red', text: '출금' },
          transfer: { color: 'blue', text: '이체' },
        };
        const config = typeMap[type as keyof typeof typeMap] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '금액',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number, record: any) => `${amount} ${record.currency}`,
    },
    {
      title: '수수료',
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      render: (fee: number, record: any) => `${fee} ${record.currency}`,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          completed: { color: 'green', text: '완료' },
          pending: { color: 'orange', text: '대기' },
          failed: { color: 'red', text: '실패' },
        };
        const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'From',
      dataIndex: 'from',
      key: 'from',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'To',
      dataIndex: 'to',
      key: 'to',
      width: 150,
      ellipsis: true,
    },
    {
      title: '시간',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
    },
  ];

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: '',
      status: '',
      dateRange: null,
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
              거래 내역
            </h2>
            <p style={{ 
              marginTop: '8px', 
              fontSize: '14px', 
              color: '#8c8c8c',
              margin: 0
            }}>
              모든 지갑의 거래 내역을 조회하고 관리할 수 있습니다.
            </p>
          </div>
          <Space>
            <Button icon={<DownloadOutlined />}>
              내보내기
            </Button>
            <Button icon={<ReloadOutlined />}>
              새로고침
            </Button>
          </Space>
        </div>

        {/* 필터 */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="거래 ID 또는 지갑 ID 검색"
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="거래 유형"
                style={{ width: '100%' }}
                value={filters.type}
                onChange={(value) => handleFilterChange('type', value)}
                allowClear
              >
                <Option value="deposit">입금</Option>
                <Option value="withdrawal">출금</Option>
                <Option value="transfer">이체</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="상태"
                style={{ width: '100%' }}
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                allowClear
              >
                <Option value="completed">완료</Option>
                <Option value="pending">대기</Option>
                <Option value="failed">실패</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Space>
                <Button icon={<FilterOutlined />} onClick={handleResetFilters}>
                  초기화
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 거래 내역 테이블 */}
        <Card>
          <Table
            columns={columns}
            dataSource={transactions}
            rowKey="id"
            pagination={{
              total: transactions.length,
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
