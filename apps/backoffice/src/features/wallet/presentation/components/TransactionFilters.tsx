import React from 'react';
import { Card, Row, Col, Input, Select, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

const { Option } = Select;

interface TransactionFiltersProps {
  filters: {
    search: string;
    type: string;
    status: string;
    dateRange: any;
  };
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  return (
    <Card style={{ marginBottom: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="거래 ID 또는 지갑 ID 검색"
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="거래 유형"
            style={{ width: '100%' }}
            value={filters.type}
            onChange={(value) => onFilterChange('type', value)}
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
            onChange={(value) => onFilterChange('status', value)}
            allowClear
          >
            <Option value="completed">완료</Option>
            <Option value="pending">대기</Option>
            <Option value="failed">실패</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Button icon={<FilterOutlined />} onClick={onReset}>
            초기화
          </Button>
        </Col>
      </Row>
    </Card>
  );
};
