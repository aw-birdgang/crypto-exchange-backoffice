import React from 'react';
import { Card, Row, Col, Input, Select, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

interface SupportFiltersProps {
  filters: {
    search: string;
    status: string;
    priority: string;
  };
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

export const SupportFilters: React.FC<SupportFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  return (
    <Card style={{ marginBottom: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Input
            placeholder="티켓 ID 또는 고객명 검색"
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Select
            placeholder="상태"
            style={{ width: '100%' }}
            value={filters.status}
            onChange={(value) => onFilterChange('status', value)}
            allowClear
          >
            <Option value="open">열림</Option>
            <Option value="in_progress">진행중</Option>
            <Option value="resolved">해결됨</Option>
            <Option value="closed">닫힘</Option>
          </Select>
        </Col>
        <Col xs={24} sm={8}>
          <Button onClick={onReset}>
            초기화
          </Button>
        </Col>
      </Row>
    </Card>
  );
};
