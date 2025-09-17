import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

export const MarketsPage: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <Title level={2} className="page-title">
          시장 관리
        </Title>
        <p className="page-description">
          거래 시장을 설정하고 관리하세요.
        </p>
      </div>
      <p>시장 관리 기능이 여기에 구현됩니다.</p>
    </div>
  );
};
