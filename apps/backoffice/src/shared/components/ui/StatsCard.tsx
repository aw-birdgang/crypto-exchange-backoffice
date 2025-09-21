import React from 'react';
import { Card, Statistic, Typography, Space, Tooltip } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTheme } from '../../theme';

const { Text } = Typography;

interface StatsCardProps {
  title: string;
  value: string | number;
  precision?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  description?: string;
  loading?: boolean;
  onClick?: () => void;
  tooltip?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'default' | 'info';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  precision,
  prefix,
  suffix,
  icon,
  trend,
  description,
  loading = false,
  onClick,
  tooltip,
  color = 'default',
}) => {
  const { theme } = useTheme();

  const getColorValue = () => {
    switch (color) {
      case 'primary':
        return theme.colors.primary[500];
      case 'success':
        return theme.colors.success[500];
      case 'warning':
        return theme.colors.warning[500];
      case 'error':
        return theme.colors.error[500];
      case 'info':
        return theme.colors.primary[500];
      default:
        return theme.colors.semantic.text.primary;
    }
  };

  const getTrendColor = () => {
    if (!trend) return theme.colors.semantic.text.secondary;
    return trend.isPositive ? theme.colors.success[500] : theme.colors.error[500];
  };

  const cardContent = (
    <Card
      hoverable={!!onClick}
      loading={loading}
      onClick={onClick}
      style={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: `1px solid ${theme.colors.semantic.border.primary}`,
      }}
      styles={{
        body: {
          padding: '20px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text
              type="secondary"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: theme.colors.semantic.text.secondary,
              }}
            >
              {title}
            </Text>
            {tooltip && (
              <Tooltip title={tooltip}>
                <InfoCircleOutlined
                  style={{
                    fontSize: '12px',
                    color: theme.colors.semantic.text.tertiary,
                  }}
                />
              </Tooltip>
            )}
          </div>
          {description && (
            <Text
              type="secondary"
              style={{
                fontSize: '12px',
                color: theme.colors.semantic.text.tertiary,
                lineHeight: 1.4,
              }}
            >
              {description}
            </Text>
          )}
        </div>
        {icon && (
          <div
            style={{
              fontSize: '24px',
              color: getColorValue(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: `${getColorValue()}15`,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Statistic
          value={value}
          precision={precision}
          prefix={prefix}
          suffix={suffix}
          valueStyle={{
            color: getColorValue(),
            fontSize: '28px',
            fontWeight: 700,
            lineHeight: 1.2,
            margin: 0,
          }}
        />

        {trend && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            {trend.isPositive ? (
              <ArrowUpOutlined style={{ color: getTrendColor(), fontSize: '12px' }} />
            ) : (
              <ArrowDownOutlined style={{ color: getTrendColor(), fontSize: '12px' }} />
            )}
            <Text
              style={{
                color: getTrendColor(),
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              {Math.abs(trend.value)}%
            </Text>
            {trend.label && (
              <Text
                type="secondary"
                style={{
                  fontSize: '12px',
                  marginLeft: 4,
                }}
              >
                {trend.label}
              </Text>
            )}
          </div>
        )}
      </div>
    </Card>
  );

  return cardContent;
};
