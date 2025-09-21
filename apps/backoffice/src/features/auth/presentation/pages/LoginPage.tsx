import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../application/stores/auth.store';
import { authService } from '../../application/services/auth.service';
import { LoginRequest } from '../../application/services/auth.service';
import { useTheme } from '../../../../shared/theme';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { theme } = useTheme();
  const [rememberMe, setRememberMe] = useState(false);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
      message.success('로그인에 성공했습니다.');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '로그인에 실패했습니다.');
    },
  });

  const onFinish = (values: LoginRequest) => {
    loginMutation.mutate(values);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[700]} 100%)`,
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 배경 장식 요소 */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle, ${theme.colors.primary[200]}20 0%, transparent 70%)`,
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-30%',
          width: '150%',
          height: '150%',
          background: `radial-gradient(circle, ${theme.colors.secondary[200]}15 0%, transparent 70%)`,
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      <Card
        className="fade-in"
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          border: `1px solid ${theme.colors.semantic.border.primary}`,
          background: theme.colors.semantic.background.primary,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[600]} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: `0 8px 16px ${theme.colors.primary[200]}`,
            }}
          >
            <UserOutlined style={{ fontSize: '28px', color: 'white' }} />
          </div>
          <Title level={2} style={{ marginBottom: 8, color: theme.colors.semantic.text.primary }}>
            Crypto Exchange
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            관리자 로그인
          </Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '이메일을 입력해주세요.' },
              { type: 'email', message: '올바른 이메일 형식이 아닙니다.' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: theme.colors.semantic.text.tertiary }} />}
              placeholder="이메일 주소"
              disabled={loginMutation.isPending}
              style={{
                height: 48,
                borderRadius: '8px',
                border: `1px solid ${theme.colors.semantic.border.primary}`,
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '비밀번호를 입력해주세요.' },
              { min: 6, message: '비밀번호는 최소 6자 이상이어야 합니다.' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: theme.colors.semantic.text.tertiary }} />}
              placeholder="비밀번호"
              disabled={loginMutation.isPending}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              style={{
                height: 48,
                borderRadius: '8px',
                border: `1px solid ${theme.colors.semantic.border.primary}`,
              }}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              <Text type="secondary">로그인 상태 유지</Text>
            </label>
            <Button type="link" style={{ padding: 0, height: 'auto' }}>
              비밀번호 찾기
            </Button>
          </div>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loginMutation.isPending}
              style={{
                width: '100%',
                height: 48,
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[600]} 100%)`,
                border: 'none',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: `0 4px 12px ${theme.colors.primary[200]}`,
              }}
            >
              로그인
            </Button>
          </Form.Item>

          <Divider style={{ margin: '16px 0' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              또는
            </Text>
          </Divider>

          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Button
              type="text"
              style={{
                width: '100%',
                height: 40,
                borderRadius: '8px',
                border: `1px solid ${theme.colors.semantic.border.primary}`,
              }}
            >
              Google로 로그인
            </Button>
            <Button
              type="text"
              style={{
                width: '100%',
                height: 40,
                borderRadius: '8px',
                border: `1px solid ${theme.colors.semantic.border.primary}`,
              }}
            >
              Microsoft로 로그인
            </Button>
          </Space>
        </Form>
      </Card>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};
