import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

export const DashboardHeader: React.FC = () => {
  return (
    <div className="page-header">
      <Title level={2} className="page-title">
        대시보드
      </Title>
      <p className="page-description">
        암호화폐 거래소 운영 현황을 한눈에 확인하세요.
      </p>
    </div>
  );
};
