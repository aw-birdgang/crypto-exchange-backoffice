import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

export const WalletsPage: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <Title level={2} className="page-title">
          지갑 관리
        </Title>
        <p className="page-description">
          사용자 지갑을 모니터링하고 관리하세요.
        </p>
      </div>
      <p>지갑 관리 기능이 여기에 구현됩니다.</p>
    </div>
  );
};
