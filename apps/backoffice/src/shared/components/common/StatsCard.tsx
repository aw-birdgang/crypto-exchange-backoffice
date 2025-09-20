import React from 'react';
import { Card, Badge } from 'antd';

interface StatsCardProps {
  icon: React.ReactNode;
  count: number;
  title: string;
  color?: string;
  iconColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  count,
  title,
  color = 'blue',
  iconColor = '#1890ff',
}) => {
  return (
    <Card>
      <div style={{ textAlign: 'center' }}>
        <Badge count={count} size="small">
          <div style={{ fontSize: '24px', color: iconColor }}>
            {icon}
          </div>
        </Badge>
        <div style={{ marginTop: '8px', fontWeight: 500 }}>{title}</div>
      </div>
    </Card>
  );
};
