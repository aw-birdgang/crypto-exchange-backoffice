import React from 'react';
import { Card, Row, Col, Badge } from 'antd';
import { 
  ClockCircleOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

interface SupportStatsCardsProps {
  stats: {
    waiting: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
}

export const SupportStatsCards: React.FC<SupportStatsCardsProps> = ({ stats }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Badge count={stats.waiting} size="small">
              <ClockCircleOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />
            </Badge>
            <div style={{ marginTop: '8px', fontWeight: 500 }}>대기 중</div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Badge count={stats.inProgress} size="small">
              <MessageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            </Badge>
            <div style={{ marginTop: '8px', fontWeight: 500 }}>진행 중</div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Badge count={stats.resolved} size="small">
              <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
            </Badge>
            <div style={{ marginTop: '8px', fontWeight: 500 }}>해결됨</div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Badge count={stats.closed} size="small">
              <CloseCircleOutlined style={{ fontSize: '24px', color: '#8c8c8c' }} />
            </Badge>
            <div style={{ marginTop: '8px', fontWeight: 500 }}>닫힘</div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};
