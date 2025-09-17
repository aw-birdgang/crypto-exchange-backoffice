import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

export const UsersPage: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <Title level={2} className="page-title">
          사용자 관리
        </Title>
        <p className="page-description">
          등록된 사용자들을 관리하고 모니터링하세요.
        </p>
      </div>
      <p>사용자 관리 기능이 여기에 구현됩니다.</p>
    </div>
  );
};
