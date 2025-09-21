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
import { useTheme } from '../../../../shared/theme';

export const DashboardPage: React.FC = () => {
  const { theme } = useTheme();
  
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
    <div className="fade-in">
      <PageHeader
        title="대시보드"
        description="암호화폐 거래소 관리 시스템 현황을 확인하세요"
        actions={
          <Space>
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              새로고침
            </Button>
            <Button
              type="text"
              icon={<ExportOutlined />}
              onClick={handleExport}
            >
              내보내기
            </Button>
            <Button
              type="text"
              icon={<SettingOutlined />}
            >
              설정
            </Button>
          </Space>
        }
      />

      {/* 통계 카드 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="총 사용자"
            value={stats.totalUsers}
            icon={<UserOutlined />}
            color="primary"
            trend={{ value: 12.5, isPositive: true, label: 'vs 지난주' }}
            description="등록된 총 사용자 수"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="오늘 주문"
            value={stats.todayOrders}
            icon={<ShoppingCartOutlined />}
            color="success"
            trend={{ value: 8.2, isPositive: true, label: 'vs 어제' }}
            description="오늘 처리된 주문 수"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
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
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="활성 시장"
            value={stats.activeMarkets}
            icon={<LineChartOutlined />}
            color="info"
            trend={{ value: 4.3, isPositive: true, label: 'vs 지난주' }}
            description="현재 거래 가능한 시장 수"
          />
        </Col>
      </Row>

      {/* 최근 거래 테이블 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <DataTable
            data={recentTransactions}
            columns={transactionColumns}
            headerTitle="최근 거래"
            headerDescription="최근 처리된 거래 내역을 확인하세요"
            onRefresh={handleRefresh}
            onExport={handleExport}
            pagination={{ pageSize: 5 }}
          />
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="시스템 상태"
            style={{ height: '100%' }}
            extra={<Button type="text" icon={<ReloadOutlined />} onClick={handleRefresh} />}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>API 서버</span>
                <StatusTag status="active" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>데이터베이스</span>
                <StatusTag status="active" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>블록체인 노드</span>
                <StatusTag status="active" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>이메일 서비스</span>
                <StatusTag status="pending" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
