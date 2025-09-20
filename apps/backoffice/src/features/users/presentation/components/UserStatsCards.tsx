import React from 'react';
import { Card, Row, Col, Statistic, Skeleton } from 'antd';
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined, UserAddOutlined } from '@ant-design/icons';
import { UserStats } from '@crypto-exchange/shared';

interface UserStatsCardsProps {
  stats: UserStats;
  isLoading?: boolean;
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ 
  stats, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Row gutter={[16, 16]}>
        {[...Array(4)].map((_, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card>
              <Skeleton active />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="전체 사용자"
            value={stats.totalUsers || 0}
            prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="활성 사용자"
            value={stats.activeUsers || 0}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="승인 대기"
            value={stats.pendingUsers || 0}
            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="오늘 가입"
            value={stats.todayRegistrations || 0}
            prefix={<UserAddOutlined style={{ color: '#722ed1' }} />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
    </Row>
  );
};
