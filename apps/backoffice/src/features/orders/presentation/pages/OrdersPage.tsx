import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

export const OrdersPage: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <Title level={2} className="page-title">
          주문 관리
        </Title>
        <p className="page-description">
          모든 주문을 모니터링하고 관리하세요.
        </p>
      </div>
      <p>주문 관리 기능이 여기에 구현됩니다.</p>
    </div>
  );
};
