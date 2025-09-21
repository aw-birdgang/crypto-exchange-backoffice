import React from 'react';
import { Tag } from 'antd';
import { useTheme } from '../../theme';

interface StatusTagProps {
  status: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'small' | 'default' | 'large';
  showDot?: boolean;
  children?: React.ReactNode;
}

const statusConfig: Record<string, { type: StatusTagProps['type']; color: string; text: string }> = {
  // 거래 상태
  completed: { type: 'success', color: '#52c41a', text: '완료' },
  pending: { type: 'warning', color: '#faad14', text: '대기중' },
  processing: { type: 'info', color: '#1890ff', text: '처리중' },
  failed: { type: 'error', color: '#ff4d4f', text: '실패' },
  cancelled: { type: 'default', color: '#d9d9d9', text: '취소됨' },
  
  // 사용자 상태
  active: { type: 'success', color: '#52c41a', text: '활성' },
  inactive: { type: 'default', color: '#d9d9d9', text: '비활성' },
  suspended: { type: 'error', color: '#ff4d4f', text: '정지됨' },
  banned: { type: 'error', color: '#ff4d4f', text: '차단됨' },
  
  // 일반 상태
  enabled: { type: 'success', color: '#52c41a', text: '활성화' },
  disabled: { type: 'default', color: '#d9d9d9', text: '비활성화' },
  approved: { type: 'success', color: '#52c41a', text: '승인됨' },
  rejected: { type: 'error', color: '#ff4d4f', text: '거부됨' },
  draft: { type: 'warning', color: '#faad14', text: '초안' },
  published: { type: 'success', color: '#52c41a', text: '게시됨' },
};

export const StatusTag: React.FC<StatusTagProps> = ({
  status,
  type,
  size = 'default',
  showDot = true,
  children,
}) => {
  const { theme } = useTheme();
  
  const config = statusConfig[status.toLowerCase()] || {
    type: type || 'default',
    color: theme.colors.semantic.text.secondary,
    text: status,
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { fontSize: '12px', padding: '2px 8px', height: '20px' };
      case 'large':
        return { fontSize: '14px', padding: '6px 12px', height: '32px' };
      default:
        return { fontSize: '12px', padding: '4px 8px', height: '24px' };
    }
  };

  const getTypeColor = () => {
    if (type) {
      switch (type) {
        case 'success':
          return theme.colors.success[500];
        case 'warning':
          return theme.colors.warning[500];
        case 'error':
          return theme.colors.error[500];
        case 'info':
          return theme.colors.primary[500];
        default:
          return theme.colors.semantic.text.secondary;
      }
    }
    return config.color;
  };

  return (
    <Tag
      color={getTypeColor()}
      style={{
        ...getSizeStyle(),
        borderRadius: '6px',
        border: 'none',
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        margin: 0,
      }}
    >
      {showDot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            opacity: 0.8,
          }}
        />
      )}
      {children || config.text}
    </Tag>
  );
};
