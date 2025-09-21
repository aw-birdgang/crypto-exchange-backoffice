import React from 'react';
import { Drawer, Button, Space, Divider } from 'antd';
import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
import { useResponsive } from '../../hooks';

interface MobileDrawerProps {
  children: React.ReactNode;
  title?: string;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  width?: number | string;
  height?: number | string;
  closable?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
}

interface MobileDrawerTriggerProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  size?: 'small' | 'middle' | 'large';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

// 모바일 드로어 컴포넌트
export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  children,
  title,
  placement = 'left',
  width = 280,
  height = '100%',
  closable = true,
  maskClosable = true,
  keyboard = true,
  className,
  style,
  onClose,
}) => {
  const { isMobile, isTablet } = useResponsive();

  // 모바일/태블릿에서만 드로어 표시
  if (!isMobile && !isTablet) {
    return <>{children}</>;
  }

  return (
    <Drawer
      title={title}
      placement={placement}
      width={width}
      height={height}
      closable={closable}
      maskClosable={maskClosable}
      keyboard={keyboard}
      className={className}
      style={style}
      onClose={onClose}
      destroyOnClose
      bodyStyle={{
        padding: '16px',
        height: '100%',
        overflow: 'auto',
      }}
    >
      {children}
    </Drawer>
  );
};

// 모바일 드로어 트리거 버튼
export const MobileDrawerTrigger: React.FC<MobileDrawerTriggerProps> = ({
  children,
  icon = <MenuOutlined />,
  type = 'text',
  size = 'middle',
  className,
  style,
  onClick,
}) => {
  const { isMobile, isTablet } = useResponsive();

  // 모바일/태블릿에서만 버튼 표시
  if (!isMobile && !isTablet) {
    return null;
  }

  return (
    <Button
      type={type}
      size={size}
      icon={icon}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '40px',
        height: '40px',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

// 모바일 네비게이션 드로어
interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
}

export const MobileNavigationDrawer: React.FC<MobileNavigationDrawerProps> = ({
  isOpen,
  onClose,
  children,
  title = '메뉴',
  footer,
}) => {
  const { isMobile, isTablet } = useResponsive();

  if (!isMobile && !isTablet) {
    return null;
  }

  return (
    <Drawer
      title={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <span style={{ fontSize: '18px', fontWeight: 600 }}>{title}</span>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            style={{ 
              minWidth: '32px', 
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        </div>
      }
      placement="left"
      width={280}
      closable={false}
      maskClosable={true}
      keyboard={true}
      open={isOpen}
      onClose={onClose}
      destroyOnClose
      bodyStyle={{
        padding: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      footer={footer ? (
        <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
          {footer}
        </div>
      ) : null}
    >
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        padding: '16px 0'
      }}>
        {children}
      </div>
    </Drawer>
  );
};

// 모바일 액션 시트
interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    danger?: boolean;
    onClick: () => void;
  }>;
  cancelText?: string;
}

export const MobileActionSheet: React.FC<MobileActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  actions,
  cancelText = '취소',
}) => {
  const { isMobile, isTablet } = useResponsive();

  if (!isMobile && !isTablet) {
    return null;
  }

  return (
    <Drawer
      title={title}
      placement="bottom"
      height="auto"
      closable={true}
      maskClosable={true}
      keyboard={true}
      open={isOpen}
      onClose={onClose}
      destroyOnClose
      bodyStyle={{
        padding: 0,
        maxHeight: '60vh',
        overflow: 'auto',
      }}
    >
      <div style={{ padding: '16px 0' }}>
        {actions.map((action, index) => (
          <div key={action.key}>
            <Button
              type="text"
              block
              size="large"
              icon={action.icon}
              danger={action.danger}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              style={{
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '0 16px',
                fontSize: '16px',
                fontWeight: action.danger ? 500 : 400,
                color: action.danger ? '#ff4d4f' : '#262626',
              }}
            >
              {action.label}
            </Button>
            {index < actions.length - 1 && <Divider style={{ margin: 0 }} />}
          </div>
        ))}
        <Divider style={{ margin: '8px 0' }} />
        <Button
          type="text"
          block
          size="large"
          onClick={onClose}
          style={{
            height: '48px',
            fontSize: '16px',
            fontWeight: 500,
            color: '#8c8c8c',
          }}
        >
          {cancelText}
        </Button>
      </div>
    </Drawer>
  );
};
