import React from 'react';
import { Row, Col, Card, Typography, Space, Button } from 'antd';
import { 
  UserOutlined, 
  ShoppingCartOutlined, 
  DollarOutlined, 
  LineChartOutlined,
  ReloadOutlined,
  ExportOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { PageHeader, StatsCard, DataTable, StatusTag } from '../../../../shared/components/ui';
import { ResponsiveGrid, ResponsiveCol, ResponsiveContainer } from '../../../../shared/components/layout/ResponsiveGrid';
import { useTheme } from '../../../../shared/theme';
import { useResponsive } from '../../../../shared/hooks';

export const DashboardPage: React.FC = () => {
  const { theme } = useTheme();
  const { isMobile, isTablet, getCardColumns } = useResponsive();
  
  const stats = {
    totalUsers: 1128,
    todayOrders: 93,
    dailyVolume: 1128934,
    activeMarkets: 24,
  };

  // 최근 거래 데이터
  const recentTransactions = [
    {
      key: '1',
      id: 'TXN001',
      user: '김철수',
      type: 'deposit',
      amount: 1000,
      currency: 'USDT',
      status: 'completed',
      timestamp: '2024-01-15 10:30:00',
    },
    {
      key: '2',
      id: 'TXN002',
      user: '이영희',
      type: 'withdrawal',
      amount: 0.5,
      currency: 'BTC',
      status: 'pending',
      timestamp: '2024-01-15 09:15:00',
    },
    {
      key: '3',
      id: 'TXN003',
      user: '박민수',
      type: 'transfer',
      amount: 250,
      currency: 'ETH',
      status: 'completed',
      timestamp: '2024-01-15 08:45:00',
    },
  ];

  const transactionColumns = [
    {
      title: '거래 ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '사용자',
      dataIndex: 'user',
      key: 'user',
      width: 100,
    },
    {
      title: '유형',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          deposit: '입금',
          withdrawal: '출금',
          transfer: '이체',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: '금액',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number, record: any) => `${amount} ${record.currency}`,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: '시간',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
    },
  ];

  const handleRefresh = () => {
    console.log('새로고침');
  };

  const handleExport = () => {
    console.log('내보내기');
  };

  return (
    <ResponsiveContainer maxWidth="2xl" padding="md">
      <div className="fade-in">
        <PageHeader
          title="대시보드"
          description="암호화폐 거래소 관리 시스템 현황을 확인하세요"
          actions={
            <Space wrap>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                size={isMobile ? 'small' : 'middle'}
              >
                {!isMobile && '새로고침'}
              </Button>
              <Button
                type="text"
                icon={<ExportOutlined />}
                onClick={handleExport}
                size={isMobile ? 'small' : 'middle'}
              >
                {!isMobile && '내보내기'}
              </Button>
              <Button
                type="text"
                icon={<SettingOutlined />}
                size={isMobile ? 'small' : 'middle'}
              >
                {!isMobile && '설정'}
              </Button>
            </Space>
          }
        />

        {/* 통계 카드 */}
        <ResponsiveGrid 
          columns={{ xs: 1, sm: 2, md: 2, lg: 4, xl: 4 }}
          spacing="md"
          style={{ marginBottom: 32 }}
        >
          <ResponsiveCol>
            <StatsCard
              title="총 사용자"
              value={stats.totalUsers}
              icon={<UserOutlined />}
              color="primary"
              trend={{ value: 12.5, isPositive: true, label: 'vs 지난주' }}
              description="등록된 총 사용자 수"
            />
          </ResponsiveCol>
          <ResponsiveCol>
            <StatsCard
              title="오늘 주문"
              value={stats.todayOrders}
              icon={<ShoppingCartOutlined />}
              color="success"
              trend={{ value: 8.2, isPositive: true, label: 'vs 어제' }}
              description="오늘 처리된 주문 수"
            />
          </ResponsiveCol>
          <ResponsiveCol>
            <StatsCard
              title="24시간 거래량"
              value={stats.dailyVolume}
              precision={2}
              suffix=" USDT"
              icon={<DollarOutlined />}
              color="warning"
              trend={{ value: -2.1, isPositive: false, label: 'vs 어제' }}
              description="24시간 총 거래량"
            />
          </ResponsiveCol>
          <ResponsiveCol>
            <StatsCard
              title="활성 시장"
              value={stats.activeMarkets}
              icon={<LineChartOutlined />}
              color="info"
              trend={{ value: 4.3, isPositive: true, label: 'vs 지난주' }}
              description="현재 거래 가능한 시장 수"
            />
          </ResponsiveCol>
        </ResponsiveGrid>

        {/* 최근 거래 테이블 */}
        <ResponsiveGrid spacing="md">
          <ResponsiveCol span={{ xs: 24, lg: 16 }}>
            <DataTable
              data={recentTransactions}
              columns={transactionColumns}
              headerTitle="최근 거래"
              headerDescription="최근 처리된 거래 내역을 확인하세요"
              onRefresh={handleRefresh}
              onExport={handleExport}
              pagination={{ 
                pageSize: isMobile ? 3 : 5,
                showSizeChanger: !isMobile,
                showQuickJumper: !isMobile,
                showTotal: !isMobile ? (total, range) => 
                  `${range[0]}-${range[1]} / ${total}개` : undefined,
              }}
            />
          </ResponsiveCol>
          <ResponsiveCol span={{ xs: 24, lg: 8 }}>
            <Card
              title="시스템 상태"
              style={{ height: isMobile ? 'auto' : '100%' }}
              extra={<Button type="text" icon={<ReloadOutlined />} onClick={handleRefresh} />}
            >
              <Space direction="vertical" style={{ width: '100%' }} size={isMobile ? 'middle' : 'large'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: isMobile ? '14px' : '16px' }}>API 서버</span>
                  <StatusTag status="active" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: isMobile ? '14px' : '16px' }}>데이터베이스</span>
                  <StatusTag status="active" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: isMobile ? '14px' : '16px' }}>블록체인 노드</span>
                  <StatusTag status="active" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: isMobile ? '14px' : '16px' }}>이메일 서비스</span>
                  <StatusTag status="pending" />
                </div>
              </Space>
            </Card>
          </ResponsiveCol>
        </ResponsiveGrid>
      </div>
    </ResponsiveContainer>
  );
};
