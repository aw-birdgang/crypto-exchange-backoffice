import React from 'react';
import { Card, Typography, Button, Space, Tag } from 'antd';
import { useAuthStore } from '../../../features/auth/application/stores/auth.store';
import { STORAGE_KEYS } from '@crypto-exchange/shared';

const { Text } = Typography;

export const AuthDebugger: React.FC = () => {
  const { user, accessToken, refreshToken, isAuthenticated, isLoading } = useAuthStore();
  
  const handleClearAuth = () => {
    console.log('🧹 Clearing all auth data...');
    
    // 모든 인증 관련 데이터 정리
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.AUTH_STORAGE);
    localStorage.removeItem(STORAGE_KEYS.PERMISSION_STORAGE);
    localStorage.removeItem(STORAGE_KEYS.AUTH_LOGGED_OUT);
    
    console.log('✅ All auth data cleared');
    window.location.reload();
  };

  const handleRefreshToken = () => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    console.log('Current token:', token);
  };

  return (
    <Card title="🔍 인증 상태 디버거" style={{ margin: '16px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>인증 상태:</Text>
          <Tag color={isAuthenticated ? 'green' : 'red'}>
            {isAuthenticated ? '인증됨' : '인증 안됨'}
          </Tag>
        </div>
        
        <div>
          <Text strong>로딩 상태:</Text>
          <Tag color={isLoading ? 'blue' : 'default'}>
            {isLoading ? '로딩 중' : '완료'}
          </Tag>
        </div>
        
        <div>
          <Text strong>사용자 정보:</Text>
          <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        <div>
          <Text strong>액세스 토큰:</Text>
          <Text code>
            {accessToken ? `${accessToken.substring(0, 20)}...` : '없음'}
          </Text>
        </div>
        
        <div>
          <Text strong>리프레시 토큰:</Text>
          <Text code>
            {refreshToken ? `${refreshToken.substring(0, 20)}...` : '없음'}
          </Text>
        </div>
        
        <div>
          <Text strong>localStorage 토큰:</Text>
          <Text code>
            {localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) 
              ? `${localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)?.substring(0, 20)}...` 
              : '없음'}
          </Text>
        </div>
        
        <div>
          <Text strong>로그아웃 플래그:</Text>
          <Tag color={localStorage.getItem(STORAGE_KEYS.AUTH_LOGGED_OUT) ? 'red' : 'green'}>
            {localStorage.getItem(STORAGE_KEYS.AUTH_LOGGED_OUT) ? '로그아웃됨' : '정상'}
          </Tag>
        </div>
        
        <Space>
          <Button onClick={handleRefreshToken} size="small">
            토큰 확인
          </Button>
          <Button onClick={handleClearAuth} size="small" danger>
            인증 초기화
          </Button>
        </Space>
      </Space>
    </Card>
  );
};
