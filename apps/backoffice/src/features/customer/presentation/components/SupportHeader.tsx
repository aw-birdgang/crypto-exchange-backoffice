import React from 'react';
import { Button, Space } from 'antd';
import { MessageOutlined, ReloadOutlined } from '@ant-design/icons';

interface SupportHeaderProps {
  onCreateTicket: () => void;
  onRefresh: () => void;
}

export const SupportHeader: React.FC<SupportHeaderProps> = ({
  onCreateTicket,
  onRefresh,
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      marginBottom: '32px',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: 700, 
          color: '#262626', 
          margin: 0,
          lineHeight: 1.2
        }}>
          고객 지원
        </h2>
        <p style={{ 
          marginTop: '8px', 
          fontSize: '14px', 
          color: '#8c8c8c',
          margin: 0
        }}>
          고객 문의사항과 지원 티켓을 관리할 수 있습니다.
        </p>
      </div>
      <Space>
        <Button icon={<MessageOutlined />} type="primary" onClick={onCreateTicket}>
          새 티켓
        </Button>
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
          새로고침
        </Button>
      </Space>
    </div>
  );
};
