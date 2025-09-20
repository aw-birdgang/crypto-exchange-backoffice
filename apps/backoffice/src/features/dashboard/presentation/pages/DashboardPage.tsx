import React from 'react';
import { Row, Col } from 'antd';
import { DashboardHeader } from '../components/DashboardHeader';
import { StatsGrid } from '../components/StatsGrid';
import { RecentOrdersCard } from '../components/RecentOrdersCard';
import { MarketStatusCard } from '../components/MarketStatusCard';

export const DashboardPage: React.FC = () => {
  const stats = {
    totalUsers: 1128,
    todayOrders: 93,
    dailyVolume: 1128934,
    activeMarkets: 24,
  };

  return (
    <div>
      <DashboardHeader />

      <StatsGrid stats={stats} />

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <RecentOrdersCard />
        </Col>
        <Col xs={24} lg={12}>
          <MarketStatusCard />
        </Col>
      </Row>
    </div>
  );
};
