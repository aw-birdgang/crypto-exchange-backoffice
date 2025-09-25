import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Space,
  Typography,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useAuditLogs } from '../../application/hooks/use-audit-logs';
import { LogCategory, LogAction, LogSeverity, LogStatus } from '../../domain/entities/audit-log.entity';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title } = Typography;

export const AuditLogFilters: React.FC = () => {
  const [form] = Form.useForm();
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const {
    filters,
    loading,
    handleFilterChange,
    handleClearFilters,
    handleExport,
  } = useAuditLogs();

  const handleSubmit = (values: any) => {
    const { dateRange, ...otherValues } = values;
    
    const newFilters = {
      ...otherValues,
      startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
    };
    
    handleFilterChange(newFilters);
  };

  const handleReset = () => {
    form.resetFields();
    handleClearFilters();
  };

  const handleExportCSV = () => {
    handleExport('csv');
  };

  const handleExportJSON = () => {
    handleExport('json');
  };

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <FilterOutlined /> 로그 필터
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          page: 1,
          limit: 20,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="search" label="검색">
              <Input
                placeholder="사용자명, 이메일, 액션 검색"
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="category" label="카테고리">
              <Select placeholder="카테고리 선택" allowClear>
                {Object.values(LogCategory).map(category => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="action" label="액션">
              <Select placeholder="액션 선택" allowClear>
                {Object.values(LogAction).map(action => (
                  <Option key={action} value={action}>
                    {action}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="status" label="상태">
              <Select placeholder="상태 선택" allowClear>
                {Object.values(LogStatus).map(status => (
                  <Option key={status} value={status}>
                    {status}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="severity" label="심각도">
              <Select placeholder="심각도 선택" allowClear>
                {Object.values(LogSeverity).map(severity => (
                  <Option key={severity} value={severity}>
                    {severity}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="userEmail" label="사용자 이메일">
              <Input placeholder="이메일 입력" allowClear />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="ipAddress" label="IP 주소">
              <Input placeholder="IP 주소 입력" allowClear />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="dateRange" label="날짜 범위">
              <RangePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                placeholder={['시작일', '종료일']}
              />
            </Form.Item>
          </Col>
        </Row>

        {showAdvanced && (
          <>
            <Divider />
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="resource" label="리소스">
                  <Input placeholder="리소스 입력" allowClear />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="subcategory" label="서브카테고리">
                  <Input placeholder="서브카테고리 입력" allowClear />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="sortBy" label="정렬 기준">
                  <Select placeholder="정렬 기준 선택">
                    <Option value="createdAt">생성일시</Option>
                    <Option value="action">액션</Option>
                    <Option value="userEmail">사용자 이메일</Option>
                    <Option value="severity">심각도</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="sortOrder" label="정렬 순서">
                  <Select placeholder="정렬 순서 선택">
                    <Option value="ASC">오름차순</Option>
                    <Option value="DESC">내림차순</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SearchOutlined />}
              >
                검색
              </Button>
              
              <Button
                onClick={handleReset}
                icon={<ReloadOutlined />}
              >
                초기화
              </Button>
              
              <Button
                type="link"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? '간단히' : '고급 필터'}
              </Button>
            </Space>
          </Col>
          
          <Col>
            <Space>
              <Button
                onClick={handleExportCSV}
                icon={<DownloadOutlined />}
                loading={loading}
              >
                CSV 내보내기
              </Button>
              
              <Button
                onClick={handleExportJSON}
                icon={<DownloadOutlined />}
                loading={loading}
              >
                JSON 내보내기
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};
