import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  className = 'page-header',
}) => {
  return (
    <div className={className}>
      <Title level={2} className="page-title">
        {title}
      </Title>
      {description && (
        <p className="page-description">
          {description}
        </p>
      )}
    </div>
  );
};
