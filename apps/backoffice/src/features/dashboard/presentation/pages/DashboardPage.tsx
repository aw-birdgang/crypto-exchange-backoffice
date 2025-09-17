import React from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  LineChartOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

export const DashboardPage: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <Title level={2} className="page-title">
          대시보드
        </Title>
        <p className="page-description">
          암호화폐 거래소 운영 현황을 한눈에 확인하세요.
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="총 사용자"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="오늘 주문"
              value={93}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="24시간 거래량"
              value={1128934}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="활성 시장"
              value={24}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="최근 주문" size="small">
            <p>주문 목록이 여기에 표시됩니다.</p>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="시장 현황" size="small">
            <p>시장 데이터가 여기에 표시됩니다.</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
