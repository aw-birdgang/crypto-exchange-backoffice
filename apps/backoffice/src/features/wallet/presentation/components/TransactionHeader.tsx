import React from 'react';
import { Button, Space } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';

interface TransactionHeaderProps {
  onExport: () => void;
  onRefresh: () => void;
}

export const TransactionHeader: React.FC<TransactionHeaderProps> = ({
  onExport,
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
          거래 내역
        </h2>
        <p style={{ 
          marginTop: '8px', 
          fontSize: '14px', 
          color: '#8c8c8c',
          margin: 0
        }}>
          모든 지갑의 거래 내역을 조회하고 관리할 수 있습니다.
        </p>
      </div>
      <Space>
        <Button icon={<DownloadOutlined />} onClick={onExport}>
          내보내기
        </Button>
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
          새로고침
        </Button>
      </Space>
    </div>
  );
};
