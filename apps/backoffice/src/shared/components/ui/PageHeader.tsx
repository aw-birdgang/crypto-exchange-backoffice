import React from 'react';
import { Typography, Breadcrumb, Button, Space, Divider } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: Array<{
    title: string;
    href?: string;
  }>;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  loading?: boolean;
  onRefresh?: () => void;
  onSettings?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumb,
  showBackButton = false,
  onBack,
  actions,
  loading = false,
  onRefresh,
  onSettings,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="page-header">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Breadcrumb */}
          {breadcrumb && breadcrumb.length > 0 && (
            <Breadcrumb
              style={{ marginBottom: 8 }}
              items={breadcrumb.map((item, index) => ({
                title: item.title,
                href: item.href,
                key: index,
              }))}
            />
          )}

          {/* Title and Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            {showBackButton && (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                style={{
                  padding: '4px 8px',
                  height: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            )}
            <Title level={2} style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>
              {title}
            </Title>
          </div>

          {/* Description */}
          {description && (
            <Text type="secondary" style={{ fontSize: '16px', lineHeight: 1.5 }}>
              {description}
            </Text>
          )}
        </div>

        {/* Actions */}
        {(actions || onRefresh || onSettings) && (
          <Space size="middle">
            {onRefresh && (
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
                title="새로고침"
              />
            )}
            {onSettings && (
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={onSettings}
                title="설정"
              />
            )}
            {actions}
          </Space>
        )}
      </div>
    </div>
  );
};
