import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '48px 0',
    }}>
      {icon && (
        <div style={{
          fontSize: '48px',
          color: '#d9d9d9',
          marginBottom: '16px'
        }}>
          {icon}
        </div>
      )}
      <Title level={3} style={{
        fontSize: '16px',
        fontWeight: 500,
        color: '#262626',
        margin: '0 0 8px 0'
      }}>
        {title}
      </Title>
      {description && (
        <p style={{
          color: '#8c8c8c',
          margin: '0 0 16px 0'
        }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
};
